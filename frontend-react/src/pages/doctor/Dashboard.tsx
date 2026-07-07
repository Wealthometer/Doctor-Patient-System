import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, appointmentApi } from '../../api/services';
import type { DoctorResponse, AppointmentResponse } from '../../types';
import { Spinner, AppointmentBadge } from '../../components/UI';
import { Stethoscope, Star, Calendar, CheckCircle, AlarmClock, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [todayAppts, setTodayAppts] = useState<AppointmentResponse[]>([]);

  useEffect(() => {
    if (!user) return;
    doctorApi.getByUserId(user.id)
      .then(async d => {
        setDoctor(d);
        // Load appointments
        const appts = await appointmentApi.getByDoctor(d.id, 0);
        const all = appts.content;
        setAppointments(all);

        const today = new Date().toISOString().split('T')[0];
        const todayList = await appointmentApi.getByDoctor(d.id, 0).then(r => r.content.filter(a => a.appointmentDate === today));
        setTodayAppts(todayList);
      })
      .catch(() => toast.error('Could not load doctor profile'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  if (!doctor) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}><Stethoscope size={48} /></div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>Profile not set up</h2>
        <p style={{ color: 'var(--clr-text-muted)' }}>Contact an administrator to set up your doctor profile.</p>
      </div>
    );
  }

  const statusCounts = {
    SCHEDULED: appointments.filter(a => a.status === 'SCHEDULED').length,
    CONFIRMED: appointments.filter(a => a.status === 'CONFIRMED').length,
    COMPLETED: appointments.filter(a => a.status === 'COMPLETED').length,
    CANCELLED: appointments.filter(a => a.status === 'CANCELLED').length,
  };

  const chartData = Object.entries(statusCounts).map(([name, count]) => ({ name, count }));

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0B2033 0%, #0B6E8A 100%)',
        borderRadius: 'var(--radius-lg)', padding: '24px 32px', color: '#fff', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 13, opacity: .75, marginBottom: 4 }}>Welcome, Doctor</div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 22, fontWeight: 700 }}>
            Dr. {doctor.firstName} {doctor.lastName}
          </h2>
          <div style={{ fontSize: 13, opacity: .75, marginTop: 4 }}>
            {doctor.specialization} • {doctor.department}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{todayAppts.length}</div>
          <div style={{ fontSize: 12, opacity: .75 }}>Appointments today</div>
          {doctor.averageRating && (
            <div style={{ fontSize: 13, marginTop: 8 }}><Star size={20} /> {doctor.averageRating.toFixed(1)} rating</div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div><div className="stat-label">Total Appointments</div><div className="stat-value">{appointments.length}</div></div><div className="stat-icon" style={{ background: 'var(--clr-primary-light)' }}><Calendar size={24} /></div></div>
        <div className="stat-card"><div><div className="stat-label">Completed</div><div className="stat-value">{statusCounts.COMPLETED}</div></div><div className="stat-icon" style={{ background: 'var(--clr-success-light)' }}><CheckCircle size={24} /></div></div>
        <div className="stat-card"><div><div className="stat-label">Upcoming</div><div className="stat-value">{statusCounts.SCHEDULED + statusCounts.CONFIRMED}</div></div><div className="stat-icon" style={{ background: 'var(--clr-accent-light)' }}><AlarmClock size={24} /></div></div>
        <div className="stat-card"><div><div className="stat-label">Cancelled</div><div className="stat-value">{statusCounts.CANCELLED}</div></div><div className="stat-icon" style={{ background: 'var(--clr-danger-light)' }}><X size={24} /></div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Today's schedule */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Today's Schedule</span>
            <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {todayAppts.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: 13 }}>
                No appointments scheduled for today
              </div>
            ) : (
              todayAppts.map(a => (
                <div key={a.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{a.patientName || 'Patient'}</div>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{a.startTime} – {a.endTime}</div>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{a.type.replace('_', ' ')}</div>
                  </div>
                  <AppointmentBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Appointment breakdown chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">Appointment Breakdown</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clr-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0B6E8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Doctor details card */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header"><span className="card-title">Profile Summary</span></div>
        <div className="card-body">
          <div className="info-grid">
            <div className="info-item"><div className="info-label">Doctor Code</div><div className="info-value">{doctor.doctorCode}</div></div>
            <div className="info-item"><div className="info-label">License #</div><div className="info-value">{doctor.licenseNumber}</div></div>
            <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{doctor.phone}</div></div>
            <div className="info-item"><div className="info-label">Email</div><div className="info-value">{doctor.email}</div></div>
            <div className="info-item"><div className="info-label">Work Hours</div><div className="info-value">{doctor.workStartTime && doctor.workEndTime ? `${doctor.workStartTime} – ${doctor.workEndTime}` : '—'}</div></div>
            <div className="info-item"><div className="info-label">Max Daily</div><div className="info-value">{doctor.maxDailyAppointments || '—'} appointments</div></div>
            <div className="info-item"><div className="info-label">Consultation Fee</div><div className="info-value">{doctor.consultationFee ? `$${doctor.consultationFee}` : '—'}</div></div>
            <div className="info-item"><div className="info-label">Experience</div><div className="info-value">{doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : '—'}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
