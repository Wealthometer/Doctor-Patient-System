import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, FileText, HeartPulse, ShieldCheck, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi } from '@/api/services';
import { useAppSelector } from '@/store';
import type { Patient } from '@/types';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadPatient = async () => {
      if (!user?.id) return;

      try {
        const { data } = await patientApi.getByUserId(user.id);
        if (active) setPatient(data);
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 404) {
          navigate('/patient/create-profile', { replace: true });
          return;
        }
        toast.error('Could not load your patient profile.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPatient();

    return () => {
      active = false;
    };
  }, [navigate, user?.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <AlertCircle className="mx-auto text-amber-500 mb-3" size={32} />
        <h1 className="text-xl font-semibold text-gray-900">Profile unavailable</h1>
        <p className="text-gray-500 mt-1">Your patient profile could not be loaded.</p>
      </div>
    );
  }

  const displayName = patient.fullName || `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {displayName}</h1>
          <p className="text-gray-600 mt-2">Patient code {patient.patientCode}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          <ShieldCheck size={16} />
          {patient.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Age" value={`${patient.age}`} icon={UserRound} detail={patient.gender.replaceAll('_', ' ')} />
        <SummaryCard label="Blood Type" value={patient.bloodType || 'N/A'} icon={HeartPulse} detail={patient.allergies ? `Allergies: ${patient.allergies}` : 'No allergies listed'} />
        <SummaryCard label="Insurance" value={patient.insuranceProvider} icon={FileText} detail={patient.insurancePolicyNumber || 'Policy number not listed'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Profile details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Detail label="Email" value={patient.email} />
            <Detail label="Phone" value={patient.phone} />
            <Detail label="Date of birth" value={patient.dateOfBirth} />
            <Detail label="Address" value={[patient.address, patient.city, patient.state, patient.zipCode].filter(Boolean).join(', ') || 'Not listed'} />
            <Detail label="Chronic conditions" value={patient.chronicConditions || 'None listed'} />
            <Detail label="Medical notes" value={patient.medicalNotes || 'None listed'} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Emergency contact</h2>
          <div className="space-y-4">
            <Detail label="Name" value={patient.emergencyContactName || 'Not listed'} />
            <Detail label="Phone" value={patient.emergencyContactPhone || 'Not listed'} />
            <Detail label="Relation" value={patient.emergencyContactRelation || 'Not listed'} />
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <Calendar className="text-blue-700" size={22} />
          <h2 className="text-lg font-semibold text-gray-900">Upcoming appointments</h2>
        </div>
        <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-600">
          Appointment history will appear here once bookings are connected to this patient profile.
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ElementType;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className="text-blue-700" size={22} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-2">{detail}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 mt-1">{value}</p>
    </div>
  );
}
