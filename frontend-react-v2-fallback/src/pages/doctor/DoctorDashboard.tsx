import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorApi, appointmentApi, prescriptionApi } from '../../api/services';
import { StatCard, Card, Badge, Button, Spinner, Avatar } from '../../components/common';
import { formatDate, formatTime } from '../../utils';
import { useAppSelector } from '../../hooks/redux';
import { Calendar, ClipboardList, Star, Clock, CheckCircle, UserCheck, ChevronRight, Stethoscope } from 'lucide-react';
import type { DoctorResponse, AppointmentResponse } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(s => s.auth.user);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [todayAppts, setTodayAppts] = useState<AppointmentResponse[]>([]);
  const [upcomingAppts, setUpcomingAppts] = useState<AppointmentResponse[]>([]);
  const [prescCount, setPrescCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const doc = await doctorApi.getByUserId(user.id);
        setDoctor(doc);

        const today = new Date().toISOString().split('T')[0];
        const [todayRes, allRes, prescRes] = await Promise.all([
          appointmentApi.getDoctorByDate(doc.id, today),
          appointmentApi.getByDoctor(doc.id, 0, 50),
          prescriptionApi.getByDoctor(doc.id, 0, 1),
        ]);

        setTodayAppts(todayRes.content);
        setUpcomingAppts(allRes.content.filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status)).slice(0, 5));
        setPrescCount(prescRes.totalElements);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) return <Spinner />;

  const todayStats = {
    total: todayAppts.length,
    scheduled: todayAppts.filter(a => a.status === 'SCHEDULED').length,
    inProgress: todayAppts.filter(a => a.status === 'IN_PROGRESS').length,
    completed: todayAppts.filter(a => a.status === 'COMPLETED').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      {doctor && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <Avatar name={`${doctor.firstName} ${doctor.lastName}`} size="lg" />
            <div>
              <p className="text-blue-200 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-bold">Dr. {doctor.firstName} {doctor.lastName}</h1>
              <p className="text-blue-200 text-sm mt-0.5">{doctor.specialization} · {doctor.department}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 bg-white/20 rounded-xl px-3 py-1.5">
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span className="font-semibold">{doctor.averageRating?.toFixed(1) ?? '—'}</span>
              <span className="text-blue-200 text-sm">({doctor.totalRatings})</span>
            </div>
          </div>
        </div>
      )}

      {/* Today stats */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Today, {formatDate(new Date().toISOString())}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard title="Total Today" value={todayStats.total} icon={<Calendar className="w-5 h-5" />} color="blue" />
          <StatCard title="Scheduled" value={todayStats.scheduled} icon={<Clock className="w-5 h-5" />} color="indigo" />
          <StatCard title="In Progress" value={todayStats.inProgress} icon={<Stethoscope className="w-5 h-5" />} color="purple" />
          <StatCard title="Completed" value={todayStats.completed} icon={<CheckCircle className="w-5 h-5" />} color="green" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Today's Schedule</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/appointments')}>
              View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-slate-100">
            {todayAppts.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No appointments today</p>
              </div>
            ) : todayAppts.map(appt => (
              <div key={appt.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate('/app/appointments')}>
                <div className="text-right w-16 shrink-0">
                  <p className="text-xs font-semibold text-slate-700">{formatTime(appt.startTime)}</p>
                  <p className="text-xs text-slate-400">{formatTime(appt.endTime)}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 shrink-0" />
                <Avatar name={appt.patientName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{appt.patientName}</p>
                  <p className="text-xs text-slate-400 truncate">{appt.type?.replace(/_/g, ' ')} · {appt.reason}</p>
                </div>
                <Badge status={appt.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Quick links + upcoming */}
        <div className="space-y-4">
          {/* Doctor info card */}
          {doctor && (
            <Card className="p-4 space-y-3">
              <h3 className="font-semibold text-slate-900 text-sm">My Info</h3>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-slate-500">License</span><span className="font-mono text-xs">{doctor.licenseNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Experience</span><span>{doctor.yearsOfExperience ?? '—'}y</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Consult Fee</span><span>${doctor.consultationFee ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Work Hours</span>
                  <span>{doctor.workStartTime && doctor.workEndTime ? `${formatTime(doctor.workStartTime)} – ${formatTime(doctor.workEndTime)}` : '—'}</span>
                </div>
                <div className="flex justify-between"><span className="text-slate-500">Work Days</span><span>{doctor.workDays || '—'}</span></div>
              </div>
            </Card>
          )}

          {/* Upcoming */}
          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Upcoming</h3>
              <span className="text-xs text-slate-400">{upcomingAppts.length} pending</span>
            </div>
            <div className="divide-y divide-slate-100">
              {upcomingAppts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No upcoming appointments</div>
              ) : upcomingAppts.map(appt => (
                <div key={appt.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate('/app/appointments')}>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{appt.patientName}</p>
                    <p className="text-xs text-slate-400">{formatDate(appt.appointmentDate)} · {formatTime(appt.startTime)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <Card className="p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'View All Appointments', icon: <Calendar className="w-4 h-4" />, path: '/app/appointments' },
                { label: 'My Prescriptions', icon: <ClipboardList className="w-4 h-4" />, path: '/app/prescriptions' },
                { label: 'Patient Records', icon: <UserCheck className="w-4 h-4" />, path: '/app/patients' },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-left">
                  {item.icon} {item.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
