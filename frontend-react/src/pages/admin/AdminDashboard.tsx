import { useEffect, useState } from 'react';
import { patientApi, doctorApi, appointmentApi, billingApi } from '@/api/services';
import { Users, Stethoscope, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import { useAppSelector } from '@/store';
=======
>>>>>>> a6232077d0e0ab37b4384586393aa4203b9a7e63

interface Stats {
  patients: { totalPatients: number; activePatients: number } | null;
  doctors:  { totalDoctors: number; activeDoctors: number } | null;
  appts:    { totalAppointments: number; todayAppointments: number; completedAppointments: number; cancelledAppointments: number } | null;
  billing:  { totalInvoices: number; paidInvoices: number; pendingInvoices: number; monthlyRevenue: number } | null;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const weeklyData = [
  { day: 'Mon', appointments: 42 },
  { day: 'Tue', appointments: 68 },
  { day: 'Wed', appointments: 55 },
  { day: 'Thu', appointments: 82 },
  { day: 'Fri', appointments: 74 },
  { day: 'Sat', appointments: 31 },
  { day: 'Sun', appointments: 19 },
];

export default function AdminDashboard() {
<<<<<<< HEAD
  const { user } = useAppSelector((s) => s.auth);
=======
>>>>>>> a6232077d0e0ab37b4384586393aa4203b9a7e63
  const [stats, setStats] = useState<Stats>({ patients: null, doctors: null, appts: null, billing: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [p, d, a, b] = await Promise.allSettled([
          patientApi.getStats(),
          doctorApi.getStats(),
          appointmentApi.getStats(),
          billingApi.getStats(),
        ]);
        setStats({
          patients: p.status === 'fulfilled' ? p.value.data : null,
          doctors:  d.status === 'fulfilled' ? d.value.data : null,
          appts:    a.status === 'fulfilled' ? a.value.data : null,
          billing:  b.status === 'fulfilled' ? b.value.data : null,
        });
      } catch {
        toast.error('Failed to load some statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    {
      label: 'Total Patients',
      value: loading ? '…' : stats.patients?.totalPatients ?? '—',
      sub: `${stats.patients?.activePatients ?? 0} active`,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Active Doctors',
      value: loading ? '…' : stats.doctors?.activeDoctors ?? '—',
      sub: `${stats.doctors?.totalDoctors ?? 0} total`,
      icon: Stethoscope,
      color: 'teal',
    },
    {
      label: "Today's Appointments",
      value: loading ? '…' : stats.appts?.todayAppointments ?? '—',
      sub: `${stats.appts?.totalAppointments ?? 0} total`,
      icon: Calendar,
      color: 'purple',
    },
    {
      label: 'Monthly Revenue',
      value: loading ? '…' : `$${Number(stats.billing?.monthlyRevenue ?? 0).toLocaleString()}`,
      sub: `${stats.billing?.paidInvoices ?? 0} invoices paid`,
      icon: DollarSign,
      color: 'amber',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  const pieData = [
    { name: 'Completed', value: stats.appts?.completedAppointments ?? 30 },
    { name: 'Scheduled', value: (stats.appts?.totalAppointments ?? 100) - (stats.appts?.completedAppointments ?? 30) - (stats.appts?.cancelledAppointments ?? 10) },
    { name: 'Cancelled', value: stats.appts?.cancelledAppointments ?? 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
<<<<<<< HEAD
          <p className="text-sm text-gray-500">Welcome back, {user?.username} — here's what's happening today.</p>
=======
          <p className="text-sm text-gray-500">Welcome back — here's what's happening today.</p>
>>>>>>> a6232077d0e0ab37b4384586393aa4203b9a7e63
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[card.color]}`}>
                <card.icon size={15} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp size={11} className="text-green-500" />
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Appointments this week</h3>
            <span className="text-xs text-gray-500">Weekly overview</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="appointments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Appointment status</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }}></span>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent activity</h3>
          <Activity size={16} className="text-gray-400" />
        </div>
        <div className="space-y-3">
          {[
            { text: 'Patient Maria Chen booked appointment with Dr. Park', time: '2m ago', color: 'bg-blue-500' },
            { text: 'Dr. James Park updated prescription for James Wu', time: '15m ago', color: 'bg-green-500' },
            { text: 'Billing invoice #INV-4821 generated for $340', time: '32m ago', color: 'bg-amber-500' },
            { text: 'New patient Carlos Diaz registered in the system', time: '1h ago', color: 'bg-purple-500' },
            { text: 'Lab report uploaded for Priya Nair — blood panel', time: '2h ago', color: 'bg-red-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.color}`}></span>
              <p className="text-sm text-gray-600 flex-1">{item.text}</p>
              <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
