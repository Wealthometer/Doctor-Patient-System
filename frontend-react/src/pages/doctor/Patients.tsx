import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, appointmentApi, patientApi, prescriptionApi } from '../../api/services';
import type { PatientResponse, AppointmentResponse, Prescription } from '../../types';
import { Spinner, EmptyState, AppointmentBadge, Modal } from '../../components/UI';
import { AlertTriangle, Droplet, Search, Slash } from 'lucide-react';
import toast from 'react-hot-toast';

interface PatientWithHistory {
  patient: PatientResponse;
  lastAppointment?: AppointmentResponse;
}

export default function DoctorPatients() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [patientMap, setPatientMap] = useState<Map<string, PatientWithHistory>>(new Map());
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PatientResponse | null>(null);
  const [patientAppts, setPatientAppts] = useState<AppointmentResponse[]>([]);
  const [patientRxs, setPatientRxs] = useState<Prescription[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'prescriptions'>('info');

  useEffect(() => {
    if (!user) return;
    doctorApi.getByUserId(user.id)
      .then(async d => {
        setDoctorId(d.id);
        // Get all appointments for this doctor to build patient list
        const appts = await appointmentApi.getByDoctor(d.id, 0);
        const patientIds = [...new Set(appts.content.map(a => a.patientId))];

        const patientData = new Map<string, PatientWithHistory>();
        await Promise.all(patientIds.map(async pid => {
          try {
            const patient = await patientApi.getById(pid);
            const lastAppt = appts.content.find(a => a.patientId === pid);
            patientData.set(pid, { patient, lastAppointment: lastAppt });
          } catch { /* skip if patient not found */ }
        }));
        setPatientMap(patientData);
      })
      .catch(() => toast.error('Could not load patient list'))
      .finally(() => setLoading(false));
  }, [user]);

  const openPatientDetail = async (patient: PatientResponse) => {
    setSelected(patient);
    setActiveTab('info');
    setDetailLoading(true);
    try {
      const [appts, rxs] = await Promise.all([
        doctorId ? appointmentApi.getByPatient(patient.id) : Promise.resolve({ content: [] }),
        prescriptionApi.getByPatient(patient.id),
      ]);
      setPatientAppts(appts.content || []);
      setPatientRxs(rxs.content || []);
    } catch { /* silently fail */ }
    finally { setDetailLoading(false); }
  };

  const patients = [...patientMap.values()];
  const filtered = patients.filter(({ patient }) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(q) ||
      patient.lastName.toLowerCase().includes(q) ||
      patient.email.toLowerCase().includes(q) ||
      patient.patientCode.toLowerCase().includes(q)
    );
  });

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div><h1>My Patients</h1><p>Patients you have seen or have upcoming appointments with</p></div>
      </div>

      <div className="search-bar" style={{ width: 300, marginBottom: 20 }}>
        <Search size={20} />
        <input placeholder="Search patients…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No patients found" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(({ patient, lastAppointment }) => (
            <div key={patient.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow .15s' }}
              onClick={() => openPatientDetail(patient)}>
              <div style={{ padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--clr-accent) 0%, var(--clr-primary) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 16,
                }}>
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{patient.firstName} {patient.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>{patient.patientCode}</div>
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{patient.phone}</div>
                  {patient.bloodType && (
                    <span className="badge badge-danger" style={{ marginTop: 6, fontSize: 11 }}><Droplet size={14} /> {patient.bloodType}</span>
                  )}
                </div>
              </div>
              {lastAppointment && (
                <div style={{ padding: '10px 20px 14px', borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>Last: {lastAppointment.appointmentDate}</div>
                  <AppointmentBadge status={lastAppointment.status} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Patient detail drawer */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 700, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--clr-accent), var(--clr-primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700,
                }}>
                  {selected.firstName[0]}{selected.lastName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.firstName} {selected.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{selected.patientCode}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="tab-bar" style={{ padding: '0 24px', marginBottom: 0 }}>
              {(['info', 'appointments', 'prescriptions'] as const).map(t => (
                <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </div>
              ))}
            </div>

            <div className="modal-body">
              {detailLoading ? <Spinner /> : (
                <>
                  {activeTab === 'info' && (
                    <div>
                      <div className="info-grid" style={{ marginBottom: 16 }}>
                        <div className="info-item"><div className="info-label">Email</div><div className="info-value">{selected.email}</div></div>
                        <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{selected.phone}</div></div>
                        <div className="info-item"><div className="info-label">DOB</div><div className="info-value">{selected.dateOfBirth}</div></div>
                        <div className="info-item"><div className="info-label">Gender</div><div className="info-value">{selected.gender}</div></div>
                        <div className="info-item"><div className="info-label">Blood Type</div><div className="info-value">{selected.bloodType || '—'}</div></div>
                        <div className="info-item"><div className="info-label">Insurance</div><div className="info-value">{selected.insuranceProvider}</div></div>
                        <div className="info-item"><div className="info-label">City</div><div className="info-value">{selected.city || '—'}</div></div>
                        <div className="info-item"><div className="info-label">Country</div><div className="info-value">{selected.country}</div></div>
                      </div>
                      {selected.allergies && (
                        <div style={{ padding: 12, background: 'var(--clr-warn-light)', borderRadius: 8, marginBottom: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-warn)' }}><AlertTriangle size={16} /> ALLERGIES</div>
                          <div style={{ fontSize: 13, marginTop: 4 }}>{selected.allergies}</div>
                        </div>
                      )}
                      {selected.chronicConditions && (
                        <div style={{ padding: 12, background: 'var(--clr-danger-light)', borderRadius: 8, marginBottom: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-danger)' }}><AlertTriangle size={16} /> CHRONIC CONDITIONS</div>
                          <div style={{ fontSize: 13, marginTop: 4 }}>{selected.chronicConditions}</div>
                        </div>
                      )}
                      {selected.medicalNotes && (
                        <div style={{ padding: 12, background: 'var(--clr-bg)', borderRadius: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)' }}>MEDICAL NOTES</div>
                          <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>{selected.medicalNotes}</div>
                        </div>
                      )}
                      {selected.emergencyContactName && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 4 }}>EMERGENCY CONTACT</div>
                          <div style={{ fontSize: 13 }}>{selected.emergencyContactName} ({selected.emergencyContactRelation}) — {selected.emergencyContactPhone}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'appointments' && (
                    <div>
                      {patientAppts.length === 0 ? <EmptyState message="No shared appointments" /> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {patientAppts.map(a => (
                            <div key={a.id} style={{ padding: 12, border: '1px solid var(--clr-border)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                              <div>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>{a.type.replace('_', ' ')}</div>
                                <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{a.appointmentDate} • {a.startTime}–{a.endTime}</div>
                                <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>{a.reason}</div>
                              </div>
                              <AppointmentBadge status={a.status} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'prescriptions' && (
                    <div>
                      {patientRxs.length === 0 ? <EmptyState message="No prescriptions issued" /> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {patientRxs.map(rx => (
                            <div key={rx.id} style={{ padding: 12, border: '1px solid var(--clr-border)', borderRadius: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ fontWeight: 500, fontSize: 13 }}>{rx.diagnosis}</div>
                                <span className={`badge ${rx.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>{rx.status}</span>
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginBottom: 6 }}>Issued: {rx.issueDate}</div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {rx.medications.map((m, i) => (
                                  <span key={i} className="badge badge-info" style={{ fontSize: 11 }}><Droplet size={10} /> {m.name} {m.dosage}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
