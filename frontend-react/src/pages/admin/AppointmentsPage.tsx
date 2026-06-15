import { useEffect, useState } from 'react';
import { appointmentApi } from '@/api/services';
import type { Appointment, Page } from '@/types';
import { Calendar, Search, Filter, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED:   'bg-blue-50 text-blue-700',
  CONFIRMED:   'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-teal-50 text-teal-700',
  COMPLETED:   'bg-gray-100 text-gray-700',
  CANCELLED:   'bg-red-50 text-red-600',
  NO_SHOW:     'bg-orange-50 text-orange-700',
};

export default function AppointmentsPage() {
  const [data, setData]       = useState<Page<Appointment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [search, setSearch]   = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // For demo we use stats/all — a real query would filter by role
      const res = await appointmentApi.getStats();
      // Fallback to mocked data shape since stats endpoint is different
      setData(res.data as unknown as Page<Appointment>);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [page]);

  const handleConfirm = async (id: string) => {
    try {
      await appointmentApi.confirm(id);
      toast.success('Appointment confirmed');
      fetchAppointments();
    } catch { toast.error('Failed to confirm'); }
  };

  const handleCancel = async (id: string) => {
    try {
      await appointmentApi.cancel(id, 'Cancelled by staff');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch { toast.error('Failed to cancel'); }
  };

  // Demo appointments for display
  const demoAppointments: Appointment[] = [
    {
      id: '1', appointmentNumber: 'APT-20260604-0001',
      patientId: 'p1', patientName: 'Maria Chen',
      doctorId: 'd1', doctorName: 'Dr. James Park',
      department: 'Cardiology', appointmentDate: '2026-06-04',
      startTime: '09:00', endTime: '09:30',
      status: 'CONFIRMED', type: 'CONSULTATION',
      reason: 'Routine checkup', createdAt: '2026-06-01T00:00:00',
    },
    {
      id: '2', appointmentNumber: 'APT-20260604-0002',
      patientId: 'p2', patientName: 'James Wu',
      doctorId: 'd2', doctorName: 'Dr. Rita Singh',
      department: 'Neurology', appointmentDate: '2026-06-04',
      startTime: '10:15', endTime: '10:45',
      status: 'IN_PROGRESS', type: 'FOLLOW_UP',
      reason: 'Follow-up on MRI results', createdAt: '2026-06-01T00:00:00',
    },
    {
      id: '3', appointmentNumber: 'APT-20260604-0003',
      patientId: 'p3', patientName: 'Priya Nair',
      doctorId: 'd1', doctorName: 'Dr. James Park',
      department: 'Cardiology', appointmentDate: '2026-06-04',
      startTime: '11:00', endTime: '11:30',
      status: 'SCHEDULED', type: 'CONSULTATION',
      reason: 'New patient — chest pain', createdAt: '2026-06-02T00:00:00',
    },
    {
      id: '4', appointmentNumber: 'APT-20260604-0004',
      patientId: 'p4', patientName: 'Carlos Diaz',
      doctorId: 'd3', doctorName: 'Dr. Samuel Lee',
      department: 'Orthopedics', appointmentDate: '2026-06-04',
      startTime: '14:00', endTime: '14:30',
      status: 'SCHEDULED', type: 'FOLLOW_UP',
      reason: 'Post-op check', createdAt: '2026-06-02T00:00:00',
    },
    {
      id: '5', appointmentNumber: 'APT-20260603-0018',
      patientId: 'p5', patientName: 'Fatima Al-Said',
      doctorId: 'd4', doctorName: 'Dr. Anya Patel',
      department: 'Pediatrics', appointmentDate: '2026-06-03',
      startTime: '09:00', endTime: '09:30',
      status: 'COMPLETED', type: 'ROUTINE_CHECKUP',
      reason: 'Annual checkup', createdAt: '2026-05-28T00:00:00',
    },
  ];

  const filtered = demoAppointments.filter((a) =>
    a.patientName.toLowerCase().includes(search.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    a.appointmentNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
          <p className="text-sm text-gray-500">Manage all patient appointments</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          <Calendar size={15} />
          New Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appointments…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select className="text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>All statuses</option>
          <option>SCHEDULED</option>
          <option>CONFIRMED</option>
          <option>IN_PROGRESS</option>
          <option>COMPLETED</option>
          <option>CANCELLED</option>
        </select>
        <button className="flex items-center gap-2 text-sm border border-gray-300 rounded-xl px-3 py-2 text-gray-600 hover:bg-gray-50">
          <Filter size={14} />
          More filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            {filtered.map((appt) => (
              <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{appt.appointmentNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{appt.patientName}</td>
                <td className="px-4 py-3 text-gray-600">{appt.doctorName}</td>
                <td className="px-4 py-3 text-gray-500">{appt.department}</td>
                <td className="px-4 py-3 text-gray-600">
                  <span>{appt.appointmentDate}</span>
                  <span className="text-gray-400 ml-1">{appt.startTime}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status] || 'bg-gray-100 text-gray-600'}`}>
                    {appt.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {appt.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleConfirm(appt.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Confirm"
                      >
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {(appt.status === 'SCHEDULED' || appt.status === 'CONFIRMED') && (
                      <>
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg" title="Start">
                          <PlayCircle size={15} />
                        </button>
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Cancel"
                        >
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">Showing {filtered.length} of {demoAppointments.length} appointments</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg">1</button>
            <button
              onClick={() => setPage(page + 1)}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
