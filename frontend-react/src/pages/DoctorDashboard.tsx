import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar, Clock, FileText, Stethoscope, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { appointmentApi, doctorApi, patientApi, prescriptionApi } from '@/api/services';
import { useAppSelector } from '@/store';
import type { Appointment, Doctor, Patient, Prescription } from '@/types';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      if (!user?.id) return;

      try {
        const doctorRes = await doctorApi.getByUserId(user.id);
        const doctorProfile = doctorRes.data;
        const [appointmentsResult, prescriptionsResult] = await Promise.allSettled([
          appointmentApi.getByDoctor(doctorProfile.id, { size: 10, sort: 'appointmentDate,desc' }),
          prescriptionApi.getByDoctor(doctorProfile.id, { size: 10, sort: 'issueDate,desc' }),
        ]);

        const appointmentsRes =
          appointmentsResult.status === 'fulfilled' ? appointmentsResult.value : null;
        const prescriptionsRes =
          prescriptionsResult.status === 'fulfilled' ? prescriptionsResult.value : null;

        const patientIds = Array.from(new Set([
          ...(appointmentsRes?.data.content.map((appointment) => appointment.patientId) ?? []),
          ...(prescriptionsRes?.data.content.map((prescription) => prescription.patientId) ?? []),
        ])).slice(0, 6);

        const patientRecords = await Promise.all(
          patientIds.map(async (patientId) => {
            try {
              const { data } = await patientApi.getById(patientId);
              return data;
            } catch {
              return null;
            }
          })
        );

        if (active) {
          setDoctor(doctorProfile);
          setAppointments(appointmentsRes?.data.content ?? []);
          setPrescriptions(prescriptionsRes?.data.content ?? []);
          setMedicalRecords(patientRecords.filter(Boolean) as Patient[]);
        }
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 404) {
          navigate('/doctor/create-profile', { replace: true });
          return;
        }
        toast.error('Could not load doctor dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate, user?.id]);

  const todaysAppointments = useMemo(() => {
    const date = new Date().toISOString().slice(0, 10);
    return appointments.filter((appointment) => appointment.appointmentDate === date);
  }, [appointments]);

  const chartData = useMemo(() => {
    const counts = weekdayLabels.map((day) => ({ day, appointments: 0 }));
    appointments.forEach((appointment) => {
      const dayIndex = new Date(`${appointment.appointmentDate}T00:00:00`).getDay();
      counts[dayIndex].appointments += 1;
    });
    return counts.slice(1).concat(counts[0]);
  }, [appointments]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white p-8 text-center">
        <AlertCircle className="mx-auto mb-3 text-amber-500" size={32} />
        <h1 className="text-xl font-semibold text-gray-900">Profile unavailable</h1>
        <p className="mt-1 text-gray-500">Your doctor profile could not be loaded.</p>
      </div>
    );
  }

  const displayName = doctor.fullName || `${doctor.firstName} ${doctor.lastName}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, Dr. {displayName}</h1>
          <p className="mt-2 text-gray-600">{doctor.department} · {doctor.specialization}</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          <Stethoscope size={16} />
          {doctor.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard label="Today's Appointments" value={`${todaysAppointments.length}`} icon={Calendar} detail="Scheduled for today" />
        <SummaryCard label="Active Patients" value={`${medicalRecords.length}`} icon={Users} detail="Loaded from patient records" />
        <SummaryCard label="Prescriptions" value={`${prescriptions.length}`} icon={FileText} detail="Recent prescriptions" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <TrendingUp className="text-blue-700" size={20} />
            Weekly appointments
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="appointments"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ fill: '#2563EB', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Clock className="text-blue-700" size={20} />
            Upcoming appointments
          </h2>
          {appointments.length === 0 ? (
            <EmptyState message="No appointments found." />
          ) : (
            <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-xs text-gray-500">{appointment.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.appointmentDate}</p>
                    <p className="text-xs text-gray-500">{appointment.startTime.slice(0, 5)} · {appointment.status.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <Stethoscope className="text-blue-700" size={22} />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Medical records</h2>
            <p className="text-sm text-gray-500">Patient profile records fetched from the patient service.</p>
          </div>
        </div>

        {medicalRecords.length === 0 ? (
          <EmptyState message="No patient medical records available yet." />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {medicalRecords.map((record) => (
              <article key={record.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{record.fullName || `${record.firstName} ${record.lastName}`}</p>
                    <p className="text-xs text-gray-500">{record.patientCode} · {record.email}</p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600">{record.status}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Detail label="Blood type" value={record.bloodType || 'N/A'} />
                  <Detail label="Allergies" value={record.allergies || 'None listed'} />
                  <Detail label="Chronic conditions" value={record.chronicConditions || 'None listed'} />
                  <Detail label="Medical notes" value={record.medicalNotes || 'None listed'} />
                </div>
              </article>
            ))}
          </div>
        )}
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
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <Icon className="text-blue-700" size={20} />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{detail}</p>
    </div>
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-5 text-sm text-gray-600">
      {message}
    </div>
  );
}
