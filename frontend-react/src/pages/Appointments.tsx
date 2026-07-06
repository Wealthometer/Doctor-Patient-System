import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, ClipboardCheck, PlayCircle, XCircle } from 'lucide-react';
import { appointmentApi, doctorApi } from '@/api/services';
import { useAppSelector } from '@/store';
import type { Appointment, Doctor } from '@/types';
import toast from 'react-hot-toast';

const statusClass: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700',
  CONFIRMED: 'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-teal-50 text-teal-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-50 text-red-600',
};

export default function Appointments() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const loadAppointments = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const doctorRes = doctor ?? (await doctorApi.getByUserId(user.id)).data;
      setDoctor(doctorRes);
      const { data } = await appointmentApi.getDoctorByDate(doctorRes.id, today, { size: 50, sort: 'startTime' });
      setAppointments(data.content);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        navigate('/doctor/create-profile', { replace: true });
        return;
      }
      toast.error('Could not load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const updateAppointment = async (id: string, action: 'confirm' | 'start' | 'complete' | 'cancel') => {
    try {
      if (action === 'confirm') await appointmentApi.confirm(id);
      if (action === 'start') await appointmentApi.start(id);
      if (action === 'complete') await appointmentApi.complete(id, { notes: 'Completed by doctor' });
      if (action === 'cancel') await appointmentApi.cancel(id, 'Cancelled by doctor');
      toast.success('Appointment updated');
      loadAppointments();
    } catch {
      toast.error('Could not update appointment');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Appointments</h1>
        <p className="text-sm text-gray-500 mt-1">{doctor?.fullName || 'Doctor schedule'} - {today}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No appointments scheduled for today.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-500">{appointment.type.replace('_', ' ')} - {appointment.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-sm text-gray-700">{appointment.startTime.slice(0, 5)}-{appointment.endTime.slice(0, 5)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusClass[appointment.status] || 'bg-gray-100 text-gray-700'}`}>
                    {appointment.status.replace('_', ' ')}
                  </span>
                  {appointment.status === 'SCHEDULED' && (
                    <button onClick={() => updateAppointment(appointment.id, 'confirm')} className="p-1 text-green-600 hover:bg-green-50 rounded-lg" title="Confirm">
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
                    <button onClick={() => updateAppointment(appointment.id, 'start')} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg" title="Start">
                      <PlayCircle size={16} />
                    </button>
                  )}
                  {appointment.status === 'IN_PROGRESS' && (
                    <button onClick={() => updateAppointment(appointment.id, 'complete')} className="p-1 text-teal-600 hover:bg-teal-50 rounded-lg" title="Complete">
                      <ClipboardCheck size={16} />
                    </button>
                  )}
                  {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                    <button onClick={() => updateAppointment(appointment.id, 'cancel')} className="p-1 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel">
                      <XCircle size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
