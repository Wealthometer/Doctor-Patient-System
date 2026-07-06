import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Pill, Plus, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { doctorApi, patientApi, prescriptionApi } from '@/api/services';
import { useAppSelector } from '@/store';
import type {
  CreatePrescriptionItemRequest,
  CreatePrescriptionRequest,
  Doctor,
  Patient,
  Prescription,
} from '@/types';

type MedicationDraft = CreatePrescriptionItemRequest;

const emptyMedication = (): MedicationDraft => ({
  medicationName: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
  quantity: 1,
  refillsAllowed: 0,
});

const today = () => new Date().toISOString().slice(0, 10);

const defaultExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
};

export default function Prescriptions() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientQuery, setPatientQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [medications, setMedications] = useState<MedicationDraft[]>([emptyMedication()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isDoctor = user?.role === 'DOCTOR';
  const isPatient = user?.role === 'PATIENT';

  const selectedPatient = useMemo(
    () => patients.find((item) => item.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  const loadPrescriptions = async () => {
    if (isDoctor && doctor?.id) {
      const { data } = await prescriptionApi.getByDoctor(doctor.id, { size: 20, sort: 'issueDate,desc' });
      setPrescriptions(data.content);
    }

    if (isPatient && patient?.id) {
      const { data } = await prescriptionApi.getByPatient(patient.id, { size: 20, sort: 'issueDate,desc' });
      setPrescriptions(data.content);
    }
  };

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        if (isDoctor) {
          const { data } = await doctorApi.getByUserId(user.id);
          if (active) setDoctor(data);
          const prescriptionsRes = await prescriptionApi.getByDoctor(data.id, { size: 20, sort: 'issueDate,desc' });
          if (active) setPrescriptions(prescriptionsRes.data.content);
        }

        if (isPatient) {
          const { data } = await patientApi.getByUserId(user.id);
          if (active) setPatient(data);
          const prescriptionsRes = await prescriptionApi.getByPatient(data.id, { size: 20, sort: 'issueDate,desc' });
          if (active) setPrescriptions(prescriptionsRes.data.content);
        }
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 404) {
          navigate(isDoctor ? '/doctor/create-profile' : '/patient/create-profile', { replace: true });
          return;
        }
        toast.error('Could not load prescriptions.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [isDoctor, isPatient, navigate, user?.id]);

  useEffect(() => {
    if (!isDoctor || patientQuery.trim().length < 2) {
      setPatients([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const { data } = await patientApi.search(patientQuery.trim(), { size: 8 });
        setPatients(data.content);
      } catch {
        toast.error('Could not search patients.');
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [isDoctor, patientQuery]);

  const updateMedication = (
    index: number,
    field: keyof MedicationDraft,
    value: string | number
  ) => {
    setMedications((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const removeMedication = (index: number) => {
    setMedications((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = (form: HTMLFormElement) => {
    form.reset();
    setSelectedPatientId('');
    setPatientQuery('');
    setPatients([]);
    setMedications([emptyMedication()]);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!doctor?.id || !selectedPatientId) {
      toast.error('Select a patient before creating a prescription.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const items = medications
      .map((item) => ({
        ...item,
        medicationName: item.medicationName.trim(),
        dosage: item.dosage.trim(),
        frequency: item.frequency.trim(),
        duration: item.duration.trim(),
        instructions: item.instructions?.trim() || undefined,
        quantity: Number(item.quantity || 1),
        refillsAllowed: Number(item.refillsAllowed || 0),
      }))
      .filter((item) => item.medicationName && item.dosage && item.frequency && item.duration);

    if (items.length === 0) {
      toast.error('Add at least one complete medication.');
      return;
    }

    const payload: CreatePrescriptionRequest = {
      patientId: selectedPatientId,
      doctorId: doctor.id,
      issueDate: String(formData.get('issueDate') || today()),
      expiryDate: String(formData.get('expiryDate') || defaultExpiryDate()),
      diagnosis: String(formData.get('diagnosis') || '').trim(),
      notes: String(formData.get('notes') || '').trim() || undefined,
      items,
    };

    if (!payload.diagnosis) {
      toast.error('Diagnosis is required.');
      return;
    }

    setSaving(true);
    try {
      await prescriptionApi.create(payload);
      await loadPrescriptions();
      resetForm(form);
      toast.success('Prescription created');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string; message?: string } } };
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Could not create prescription.');
    } finally {
      setSaving(false);
    }
  };

  const cancelPrescription = async (id: string) => {
    try {
      await prescriptionApi.cancel(id);
      await loadPrescriptions();
      toast.success('Prescription cancelled');
    } catch {
      toast.error('Could not cancel prescription.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            <Pill size={20} />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isDoctor ? 'Prescription Management' : 'My Prescriptions'}
            </h1>
            <p className="text-sm text-gray-500">
              {isDoctor ? 'Create and manage patient prescriptions.' : 'View prescriptions issued by your care team.'}
            </p>
          </div>
        </div>
      </div>

      {isDoctor && (
        <form onSubmit={handleCreate} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Create prescription</h2>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <label className="lg:col-span-2 block">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">Patient</span>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  value={patientQuery}
                  onChange={(event) => {
                    setPatientQuery(event.target.value);
                    setSelectedPatientId('');
                  }}
                  className="form-input pl-9"
                  placeholder="Search by name, email, or patient code"
                />
              </div>
              {patients.length > 0 && !selectedPatientId && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-sm">
                  {patients.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(item.id);
                        setPatientQuery(item.fullName || `${item.firstName} ${item.lastName}`);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50"
                    >
                      <span className="font-medium text-gray-900">{item.fullName || `${item.firstName} ${item.lastName}`}</span>
                      <span className="ml-2 text-xs text-gray-500">{item.patientCode}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedPatient && (
                <p className="mt-1 text-xs text-gray-500">
                  Selected {selectedPatient.patientCode}
                </p>
              )}
            </label>

            <Field label="Issue date">
              <input name="issueDate" type="date" defaultValue={today()} className="form-input" />
            </Field>
            <Field label="Expiry date">
              <input name="expiryDate" type="date" defaultValue={defaultExpiryDate()} className="form-input" />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Field label="Diagnosis">
              <textarea name="diagnosis" required className="form-input min-h-24" />
            </Field>
            <Field label="Notes">
              <textarea name="notes" className="form-input min-h-24" />
            </Field>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Medications</h3>
              <button
                type="button"
                onClick={() => setMedications((current) => [...current, emptyMedication()])}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus size={16} />
                Add medication
              </button>
            </div>

            {medications.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Medication {index + 1}</p>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-red-600"
                      title="Remove medication"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    value={item.medicationName}
                    onChange={(event) => updateMedication(index, 'medicationName', event.target.value)}
                    className="form-input"
                    placeholder="Medication"
                  />
                  <input
                    value={item.dosage}
                    onChange={(event) => updateMedication(index, 'dosage', event.target.value)}
                    className="form-input"
                    placeholder="Dosage"
                  />
                  <input
                    value={item.frequency}
                    onChange={(event) => updateMedication(index, 'frequency', event.target.value)}
                    className="form-input"
                    placeholder="Frequency"
                  />
                  <input
                    value={item.duration}
                    onChange={(event) => updateMedication(index, 'duration', event.target.value)}
                    className="form-input"
                    placeholder="Duration"
                  />
                  <input
                    value={item.instructions || ''}
                    onChange={(event) => updateMedication(index, 'instructions', event.target.value)}
                    className="form-input md:col-span-2"
                    placeholder="Instructions"
                  />
                  <input
                    value={item.quantity || 1}
                    onChange={(event) => updateMedication(index, 'quantity', Number(event.target.value))}
                    className="form-input"
                    min="1"
                    type="number"
                    placeholder="Quantity"
                  />
                  <input
                    value={item.refillsAllowed || 0}
                    onChange={(event) => updateMedication(index, 'refillsAllowed', Number(event.target.value))}
                    className="form-input"
                    min="0"
                    max="12"
                    type="number"
                    placeholder="Refills"
                  />
                </div>
              </div>
            ))}
          </div>
        </form>
      )}

      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <FileText className="text-blue-700" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Prescription history</h2>
        </div>

        {prescriptions.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-5 text-sm text-gray-600">
            No prescriptions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
            {prescriptions.map((prescription) => (
              <article key={prescription.id} className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{prescription.prescriptionNumber}</p>
                      <StatusBadge status={prescription.status} />
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {isDoctor ? prescription.patientName : prescription.doctorName}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Issued {prescription.issueDate} · Expires {prescription.expiryDate}
                    </p>
                  </div>

                  {isDoctor && prescription.status === 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => cancelPrescription(prescription.id)}
                      className="w-fit rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <Detail label="Diagnosis" value={prescription.diagnosis || 'Not listed'} />
                  <Detail label="Notes" value={prescription.notes || 'None'} />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {prescription.items.map((item) => (
                    <div key={item.id} className="rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-900">{item.medicationName}</p>
                      <p className="mt-1 text-sm text-gray-600">{item.dosage} · {item.frequency} · {item.duration}</p>
                      <p className="mt-1 text-xs text-gray-500">{item.instructions || 'No special instructions'}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        Qty {item.quantity || 'N/A'} · Refills {item.refillsUsed}/{item.refillsAllowed || 0}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes = status === 'ACTIVE'
    ? 'bg-green-50 text-green-700'
    : status === 'CANCELLED'
      ? 'bg-red-50 text-red-700'
      : 'bg-amber-50 text-amber-700';

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
