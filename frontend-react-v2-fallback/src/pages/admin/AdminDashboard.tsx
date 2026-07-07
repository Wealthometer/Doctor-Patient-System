import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { patientApi, doctorApi, appointmentApi, billingApi } from '../../api/services';
import { StatCard, Spinner, Card } from '../../components/common';
import { formatCurrency } from '../../utils';
import { Users, Stethoscope, Calendar, CreditCard, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { PatientStatsResponse, DoctorStatsResponse, AppointmentStatsResponse, BillingStatsResponse } from '../../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [patientStats, setPatientStats] = useState<PatientStatsResponse | null>(null);
  const [doctorStats, setDoctorStats] = useState<DoctorStatsResponse | null>(null);
  const [apptStats, setApptStats] = useState<AppointmentStatsResponse | null>(null);
  const [billingStats, setBillingStats] = useState<BillingStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      patientApi.getStats(),
      doctorApi.getStats(),
      appointmentApi.getStats(),
      billingApi.getStats(),
    ]).then(([p, d, a, b]) => {
      setPatientStats(p);
      setDoctorStats(d);
      setApptStats(a);
      setBillingStats(b);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const apptChartData = apptStats?.byDepartment
    ? Object.entries(apptStats.byDepartment).map(([dept, count]) => ({ name: dept, count }))
    : [];

  const apptPieData = apptStats ? [
    { name: 'Scheduled', value: apptStats.scheduledAppointments },
    { name: 'Completed', value: apptStats.completedAppointments },
    { name: 'Cancelled', value: apptStats.cancelledAppointments },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">System overview and analytics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={patientStats?.totalPatients ?? 0} icon={<Users className="w-5 h-5" />}
          color="blue" subtitle={`${patientStats?.activePatients ?? 0} active`} />
        <StatCard title="Total Doctors" value={doctorStats?.totalDoctors ?? 0} icon={<Stethoscope className="w-5 h-5" />}
          color="green" subtitle={`${doctorStats?.activeDoctors ?? 0} on duty`} />
        <StatCard title="Today's Appointments" value={apptStats?.todayAppointments ?? 0} icon={<Calendar className="w-5 h-5" />}
          color="purple" subtitle={`${apptStats?.totalAppointments ?? 0} total`} />
        <StatCard title="Total Revenue" value={formatCurrency(billingStats?.totalRevenue ?? 0)} icon={<CreditCard className="w-5 h-5" />}
          color="yellow" subtitle={`${billingStats?.paidInvoices ?? 0} paid invoices`} />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Scheduled" value={apptStats?.scheduledAppointments ?? 0} icon={<Clock className="w-5 h-5" />} color="indigo" />
        <StatCard title="Completed" value={apptStats?.completedAppointments ?? 0} icon={<CheckCircle className="w-5 h-5" />} color="green" />
        <StatCard title="Cancelled" value={apptStats?.cancelledAppointments ?? 0} icon={<XCircle className="w-5 h-5" />} color="red" />
        <StatCard title="Pending Amount" value={formatCurrency(billingStats?.pendingAmount ?? 0)} icon={<TrendingUp className="w-5 h-5" />} color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Department bar chart */}
        <Card className="xl:col-span-2 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Appointments by Department</h3>
          {apptChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={apptChartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No department data yet</div>
          )}
        </Card>

        {/* Appointment status pie */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Appointment Status</h3>
          {apptPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={apptPieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                    {apptPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {apptPieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Manage Patients', path: 'patients', icon: <Users className="w-5 h-5" />, color: 'bg-blue-500' },
          { label: 'Manage Doctors', path: 'doctors', icon: <Stethoscope className="w-5 h-5" />, color: 'bg-emerald-500' },
          { label: 'Appointments', path: 'appointments', icon: <Calendar className="w-5 h-5" />, color: 'bg-purple-500' },
          { label: 'Billing', path: 'billing', icon: <CreditCard className="w-5 h-5" />, color: 'bg-amber-500' },
        ].map(item => (
          <Card key={item.path} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/app/${item.path}`)}>
            <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white mb-3`}>
              {item.icon}
            </div>
            <p className="font-medium text-slate-800 text-sm">{item.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
