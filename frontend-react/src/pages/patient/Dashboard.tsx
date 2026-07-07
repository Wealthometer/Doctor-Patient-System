import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientApi, appointmentApi, prescriptionApi, billingApi } from '../../api/services';
import type { PatientResponse, AppointmentResponse, Prescription } from '../../types';
import { Spinner, AppointmentBadge } from '../../components/UI';
import { Calendar, Package, CreditCard, Droplet, Search, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoiceCount, setInvoiceCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      patientApi.getByUserId(user.id).catch(() => null),
    ]).then(([p]) => {
      setPatient(p);
      if (p) {
        return Promise.all([
          appointmentApi.getByPatient(p.id).catch(() => null),
          prescriptionApi.getActiveByPatient(p.id).catch(() => null),
          billingApi.getPatientInvoices(p.id).catch(() => null),
        ]).then(([apts, rxs, bills]) => {
          setAppointments(apts?.content?.slice(0, 5) || []);
          setPrescriptions(rxs?.content?.slice(0, 3) || []);
          setInvoiceCount(bills?.totalElements || 0);
        });
      }
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <Spinner />;

  if (!patient) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}><User size={48} /></div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>Complete your profile</h2>
        <p style={{ color: 'var(--clr-text-muted)', marginBottom: 24 }}>Please set up your patient profile to access all features.</p>
        <Link to="/patient/profile" className="btn btn-primary">Set up profile →</Link>
      </div>
    );
  }

  const upcoming = appointments.filter(a => ['SCHEDULED', 'CONFIRMED'].includes(a.status));
  const activePrescriptions = prescriptions.filter(p => p.status === 'ACTIVE');

  return (
    <div>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary-dark) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '28px 32px', color: '#fff', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: 13, opacity: .8, marginBottom: 4 }}>Welcome back</div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: 24, fontWeight: 700 }}>
            {patient.firstName} {patient.lastName}
          </h2>
          <div style={{ fontSize: 13, opacity: .8, marginTop: 4 }}>Patient ID: {patient.patientCode}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, opacity: .9 }}>
          <div>{patient.insuranceProvider}</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: .7 }}>Insurance Provider</div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--clr-accent)' }}>
          <div>
            <div className="stat-label">Upcoming Appointments</div>
            <div className="stat-value">{upcoming.length}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--clr-accent-light)' }}><Calendar size={24} /></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--clr-primary)' }}>
          <div>
            <div className="stat-label">Active Prescriptions</div>
            <div className="stat-value">{activePrescriptions.length}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--clr-primary-light)' }}><Package size={24} /></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--clr-warn)' }}>
          <div>
            <div className="stat-label">Total Invoices</div>
            <div className="stat-value">{invoiceCount}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--clr-warn-light)' }}><CreditCard size={24} /></div>
        </div>
        {patient.bloodType && (
          <div className="stat-card" style={{ borderLeft: '3px solid var(--clr-danger)' }}>
            <div>
              <div className="stat-label">Blood Type</div>
              <div className="stat-value">{patient.bloodType}</div>
            </div>
            <div className="stat-icon" style={{ background: 'var(--clr-danger-light)' }}><Droplet size={24} /></div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* Upcoming appointments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Appointments</span>
            <Link to="/patient/appointments" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {appointments.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                No appointments yet. <Link to="/patient/appointments" style={{ color: 'var(--clr-primary)' }}>Book one →</Link>
              </div>
            ) : (
              appointments.map(a => (
                <div key={a.id} style={{ padding: '14px 24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{a.type.replace('_', ' ')}</div>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
                      {a.appointmentDate} • {a.startTime} – {a.endTime}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>
                      Dr. {a.doctorName || 'Unknown'}
                    </div>
                  </div>
                  <AppointmentBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Health alerts */}
          {(patient.allergies || patient.chronicConditions) && (
            <div className="card">
              <div className="card-header"><span className="card-title">Health Alerts</span></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {patient.allergies && (
                  <div style={{ padding: 10, background: 'var(--clr-warn-light)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-warn)', marginBottom: 3 }}>ALLERGIES</div>
                    <div style={{ fontSize: 13 }}>{patient.allergies}</div>
                  </div>
                )}
                {patient.chronicConditions && (
                  <div style={{ padding: 10, background: 'var(--clr-danger-light)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-danger)', marginBottom: 3 }}>CHRONIC CONDITIONS</div>
                    <div style={{ fontSize: 13 }}>{patient.chronicConditions}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active prescriptions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Active Prescriptions</span>
              <Link to="/patient/prescriptions" className="btn btn-ghost btn-sm">View all</Link>
            </div>
            <div className="card-body" style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activePrescriptions.length === 0 ? (
                <div style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>No active prescriptions</div>
              ) : (
                activePrescriptions.map(rx => (
                  <div key={rx.id} style={{ padding: 10, background: 'var(--clr-bg)', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {rx.medications.map(m => m.name).join(', ')}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>
                      Dr. {rx.doctorName} • {rx.issueDate}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-header"><span className="card-title">Quick Actions</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/patient/appointments" className="btn btn-primary" style={{ justifyContent: 'center' }}><Calendar size={20} /> Book Appointment</Link>
              <Link to="/patient/doctors" className="btn btn-ghost" style={{ justifyContent: 'center' }}><Search size={20} /> Find a Doctor</Link>
              <Link to="/patient/billing" className="btn btn-ghost" style={{ justifyContent: 'center' }}><CreditCard size={20} /> View Invoices</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
