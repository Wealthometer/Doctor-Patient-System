import { useState, useEffect } from 'react';
import { patientApi, doctorApi, appointmentApi, billingApi } from '../../api/services';
import { StatCard, Spinner } from '../../components/UI';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { Users, Stethoscope, Calendar, DollarSign, AlertTriangle, BarChart as LucideBarChart } from 'lucide-react';

const COLORS = ['#0B6E8A', '#17C3A3', '#E8A020', '#D94040', '#7C3AED'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    patients: null as any,
    doctors: null as any,
    appointments: null as any,
    billing: null as any,
  });

  useEffect(() => {
    Promise.all([
      patientApi.stats().catch(() => null),
      doctorApi.stats().catch(() => null),
      appointmentApi.stats().catch(() => null),
      billingApi.stats().catch(() => null),
    ]).then(([patients, doctors, appointments, billing]) => {
      setData({ patients, doctors, appointments, billing });
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  const { patients, doctors, appointments, billing } = data;

  // Build dept chart data
  const deptData = doctors?.byDepartment
    ? Object.entries(doctors.byDepartment).map(([name, count]) => ({ name, count }))
    : [{ name: 'Cardiology', count: 4 }, { name: 'Neurology', count: 3 }, { name: 'Pediatrics', count: 6 }];

  // Appointment status breakdown
  const apptPie = [
    { name: 'Completed', value: appointments?.completed || 0 },
    { name: 'Confirmed', value: appointments?.confirmed || 0 },
    { name: 'Scheduled', value: appointments?.scheduled || 0 },
    { name: 'Cancelled', value: appointments?.cancelled || 0 },
  ].filter(d => d.value > 0);

  // Revenue trend (mock for visual - real data would come from time-based API)
  const revenueTrend = [
    { month: 'Jan', revenue: 42000 },
    { month: 'Feb', revenue: 38500 },
    { month: 'Mar', revenue: 51200 },
    { month: 'Apr', revenue: 47800 },
    { month: 'May', revenue: 59300 },
    { month: 'Jun', revenue: 63100 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>System overview and key performance indicators</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Patients"
          value={patients?.total ?? '—'}
          icon={<Users size={24} />}
          iconBg="var(--clr-primary-light)"
          change={patients?.newThisMonth ? `+${patients.newThisMonth} this month` : undefined}
        />
        <StatCard
          label="Active Doctors"
          value={doctors?.active ?? '—'}
          icon={<Stethoscope size={24} />}
          iconBg="var(--clr-accent-light)"
        />
        <StatCard
          label="Today's Appointments"
          value={appointments?.todayTotal ?? '—'}
          icon={<Calendar size={24} />}
          iconBg="var(--clr-warn-light)"
        />
        <StatCard
          label="Revenue (This Month)"
          value={billing?.paidThisMonth ? `$${billing.paidThisMonth.toLocaleString()}` : '—'}
          icon={<DollarSign size={24} />}
          iconBg="var(--clr-success-light)"
        />
        <StatCard
          label="Pending Invoices"
          value={billing?.overdueCount ?? '—'}
          icon={<AlertTriangle size={24} />}
          iconBg="var(--clr-danger-light)"
        />
        <StatCard
          label="Total Appointments"
          value={appointments?.total ?? '—'}
          icon={<LucideBarChart size={24} />}
          iconBg="#EDE9FE"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue trend */}
        <div className="card">
          <div className="card-header"><span className="card-title">Revenue Trend</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B6E8A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0B6E8A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#0B6E8A" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment status pie */}
        <div className="card">
          <div className="card-header"><span className="card-title">Appointment Status</span></div>
          <div className="card-body">
            {apptPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={apptPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name }) => name}>
                    {apptPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--clr-text-muted)', fontSize: 13 }}>No appointment data</div>
            )}
          </div>
        </div>
      </div>

      {/* Doctors by department */}
      <div className="card">
        <div className="card-header"><span className="card-title">Doctors by Department</span></div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#17C3A3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
