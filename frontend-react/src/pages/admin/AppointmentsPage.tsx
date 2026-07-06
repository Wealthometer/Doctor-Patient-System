import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentApi, patientApi } from '@/api/services';
import { useAppSelector } from '@/store';
import type { Appointment, Page, Patient } from '@/types';
import { Calendar, Search, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700',
  CONFIRMED: 'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-teal-50 text-teal-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-50 text-red-600',
  NO_SHOW: 'bg-orange-50 text-orange-700',
};

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [data, setData] = useState<Page<Appointment> | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      if (user?.role === 'PATIENT') {
        const patientRes = patient ?? (await patientApi.getByUserId(user.id)).data;
        setPatient(patientRes);
        const res = await appointmentApi.getByPatient(patientRes.id, { page, size: 20, sort: 'appointmentDate,desc' });
        setData(res.data);
      } else {
        const res = await appointmentApi.getAll({ page, size: 20, sort: 'appointmentDate,desc' });
        setData(res.data);
      }
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, user?.id, user?.role]);

  const appointments = data?.content ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return appointments;

    return appointments.filter((a) =>
      a.patientName.toLowerCase().includes(query) ||
      a.doctorName.toLowerCase().includes(query) ||
      a.appointmentNumber.toLowerCase().includes(query) ||
      a.department.toLowerCase().includes(query)
    );
  }, [appointments, search]);

  const handleConfirm = async (id: string) => {
    try {
      await appointmentApi.confirm(id);
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch {
      toast.error('Failed to confirm appointment');
    }
  };

  const handleStart = async (id: string) => {
    try {
      await appointmentApi.start(id);
      toast.success('Appointment started');
      fetchAppointments();
    } catch {
      toast.error('Failed to start appointment');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await appointmentApi.cancel(id, user?.role === 'PATIENT' ? 'Cancelled by patient' : 'Cancelled by staff');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch {
      toast.error('Failed to cancel appointment');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{user?.role === 'PATIENT' ? 'My Appointments' : 'Appointments'}</h2>
          <p className="text-sm text-gray-500">{user?.role === 'PATIENT' ? 'Review and manage your visits' : 'Manage all patient appointments'}</p>
        </div>
        {user?.role === 'PATIENT' && (
          <button
            onClick={() => navigate('/patient/book-appointment')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Calendar size={15} />
            New Appointment
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search appointments..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Appointment #</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Patient</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Doctor</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Department</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Date & Time</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading appointments...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No appointments found.</td></tr>
            ) : filtered.map((appt) => (
              <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{appt.appointmentNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{appt.patientName}</td>
                <td className="px-4 py-3 text-gray-600">{appt.doctorName}</td>
                <td className="px-4 py-3 text-gray-500">{appt.department}</td>
                <td className="px-4 py-3 text-gray-600">
                  <span>{appt.appointmentDate}</span>
                  <span className="text-gray-400 ml-1">{appt.startTime.slice(0, 5)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status] || 'bg-gray-100 text-gray-600'}`}>
                    {appt.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {appt.status === 'SCHEDULED' && user?.role !== 'PATIENT' && (
                      <button onClick={() => handleConfirm(appt.id)} className="p-1 text-green-600 hover:bg-green-50 rounded-lg" title="Confirm">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {(appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED') && user?.role !== 'PATIENT' && (
                      <button onClick={() => handleStart(appt.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg" title="Start">
                        <PlayCircle size={15} />
                      </button>
                    )}
                    {(appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED' || appt.status === 'IN_PROGRESS') && (
                      <button onClick={() => handleCancel(appt.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel">
                        <XCircle size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">Showing {filtered.length} of {data?.totalElements ?? 0} appointments</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg">{page + 1}</button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={data?.last ?? true}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
