import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { prescriptionApi, doctorApi, patientApi } from '../../api/services';
import {
  Table, Badge, Button, Modal, Input, Textarea,
  Pagination, Card, EmptyState, Avatar,
} from '../../components/common';
import { formatDate } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import { Plus, RefreshCw, Eye, XCircle, ClipboardList, Trash2 } from 'lucide-react';
import type { Prescription, CreatePrescriptionRequest, DoctorResponse, PatientResponse } from '../../types';

export const PrescriptionsPage: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);
  const [searchParams] = useSearchParams();
  const filterPatientId = searchParams.get('patientId');

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [myPatient, setMyPatient] = useState<PatientResponse | null>(null);
  const [myDoctor, setMyDoctor] = useState<DoctorResponse | null>(null);

  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';
  const isPatient = user?.role === 'PATIENT';

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CreatePrescriptionRequest>({
    defaultValues: { items: [{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' as any });

  useEffect(() => {
    if (isPatient && user) patientApi.getByUserId(user.id).then(setMyPatient).catch(() => {});
    if (isDoctor && user) doctorApi.getByUserId(user.id).then(setMyDoctor).catch(() => {});
  }, [user, isPatient, isDoctor]);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (filterPatientId) {
        res = await prescriptionApi.getByPatient(filterPatientId, page);
      } else if (isPatient && myPatient) {
        res = await prescriptionApi.getByPatient(myPatient.id, page);
      } else if (isDoctor && myDoctor) {
        res = await prescriptionApi.getByDoctor(myDoctor.id, page);
      } else {
        res = { content: [], totalElements: 0 };
      }
      setPrescriptions(res.content);
      setTotal(res.totalElements);
    } catch { toast.error('Failed to load prescriptions'); }
    finally { setLoading(false); }
  }, [page, myPatient, myDoctor, filterPatientId, isPatient, isDoctor]);

  useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

  const handleCreate = async (data: CreatePrescriptionRequest) => {
    setCreateLoading(true);
    try {
      const payload = { ...data };
      if (isDoctor && myDoctor) payload.doctorId = myDoctor.id;
      await prescriptionApi.create(payload);
      toast.success('Prescription created');
      setShowCreate(false);
      reset();
      fetchPrescriptions();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create prescription');
    } finally { setCreateLoading(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this prescription?')) return;
    try { await prescriptionApi.cancel(id); toast.success('Prescription cancelled'); fetchPrescriptions(); setSelected(null); }
    catch { toast.error('Failed to cancel'); }
  };

  const columns = [
    { key: 'prescriptionNumber', header: 'Rx #', render: (p: Prescription) => <span className="font-mono text-xs text-slate-500">{p.prescriptionNumber}</span> },
    { key: 'patientName', header: 'Patient', render: (p: Prescription) => <span className="text-sm font-medium">{p.patientName}</span> },
    { key: 'doctorName', header: 'Doctor', render: (p: Prescription) => <span className="text-sm">Dr. {p.doctorName}</span> },
    { key: 'issueDate', header: 'Issued', render: (p: Prescription) => <span className="text-sm">{formatDate(p.issueDate)}</span> },
    { key: 'expiryDate', header: 'Expires', render: (p: Prescription) => <span className="text-sm">{formatDate(p.expiryDate)}</span> },
    { key: 'items', header: 'Medications', render: (p: Prescription) => <span className="text-sm">{p.items?.length ?? 0} item(s)</span> },
    { key: 'status', header: 'Status', render: (p: Prescription) => <Badge status={p.status} /> },
    {
      key: 'actions', header: '',
      render: (p: Prescription) => (
        <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={e => { e.stopPropagation(); setSelected(p); }}>View</Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>
          <p className="text-slate-500 text-sm">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchPrescriptions}>Refresh</Button>
          {(isDoctor || isAdmin) && (
            <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCreate(true)}>New Prescription</Button>
          )}
        </div>
      </div>

      <Card>
        {prescriptions.length === 0 && !loading ? (
          <EmptyState
            icon={<ClipboardList className="w-12 h-12" />}
            title="No prescriptions found"
            description="Prescriptions created by doctors will appear here."
            action={(isDoctor || isAdmin) ? <Button size="sm" onClick={() => setShowCreate(true)}>Create Prescription</Button> : undefined}
          />
        ) : (
          <>
            <Table columns={columns} data={prescriptions} loading={loading} onRowClick={setSelected} />
            {total > 20 && <Pagination page={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} totalElements={total} size={20} />}
          </>
        )}
      </Card>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Prescription Details" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Rx Number', selected.prescriptionNumber],
                ['Patient', selected.patientName],
                ['Doctor', `Dr. ${selected.doctorName}`],
                ['Issue Date', formatDate(selected.issueDate)],
                ['Expiry Date', formatDate(selected.expiryDate)],
                ['Status', ''],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  {label === 'Status' ? <Badge status={selected.status} /> : <p className="text-slate-900">{value}</p>}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">Medications</p>
              <div className="space-y-3">
                {selected.items?.map((item, i) => (
                  <div key={item.id || i} className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-slate-900 text-sm">{item.medicationName}</p>
                      <span className="text-xs text-blue-600 font-medium">{item.dosage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 mt-2 text-xs text-slate-600">
                      <span>Frequency: {item.frequency}</span>
                      <span>Duration: {item.duration}</span>
                    </div>
                    {item.instructions && <p className="text-xs text-slate-500 mt-1 italic">{item.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
            {selected.notes && (
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{selected.notes}</p>
              </div>
            )}
            {(isDoctor || isAdmin) && selected.status === 'ACTIVE' && (
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button size="sm" variant="danger" icon={<XCircle className="w-3.5 h-3.5" />} onClick={() => handleCancel(selected.id)}>Cancel Prescription</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create prescription modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="New Prescription" size="xl">
        <form onSubmit={handleSubmit(handleCreate)} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {!isDoctor && <Input label="Doctor ID" {...register('doctorId', { required: 'Required' })} placeholder="UUID" />}
            <Input label="Patient ID" {...register('patientId', { required: 'Required' })} placeholder="UUID" />
            <Input label="Appointment ID (optional)" {...register('appointmentId')} placeholder="UUID" />
            <Input label="Expiry Date" type="date" {...register('expiryDate')} />
          </div>
          <Textarea label="Notes" {...register('notes')} placeholder="General prescription notes..." />
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">Medications</label>
              <Button type="button" size="sm" variant="outline" icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => append({ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' } as any)}>
                Add Medication
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="p-4 rounded-lg border border-slate-200 space-y-3 relative">
                  <button type="button" onClick={() => remove(i)}
                    className="absolute top-3 right-3 p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Medication Name" {...register(`items.${i}.medicationName` as any, { required: 'Required' })} />
                    <Input label="Dosage" {...register(`items.${i}.dosage` as any)} placeholder="e.g. 500mg" />
                    <Input label="Frequency" {...register(`items.${i}.frequency` as any)} placeholder="e.g. Twice daily" />
                    <Input label="Duration" {...register(`items.${i}.duration` as any)} placeholder="e.g. 7 days" />
                  </div>
                  <Input label="Instructions" {...register(`items.${i}.instructions` as any)} placeholder="e.g. Take after meals" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={createLoading}>Create Prescription</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
