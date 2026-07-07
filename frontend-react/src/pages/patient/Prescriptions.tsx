import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi, prescriptionApi } from '../../api/services';
import type { Prescription } from '../../types';
import { Spinner, EmptyState, Pagination, Modal } from '../../components/UI';
import toast from 'react-hot-toast';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    if (!user) return;
    patientApi.getByUserId(user.id)
      .then(p => { setPatientId(p.id); return loadPrescriptions(p.id, 0, false); })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const loadPrescriptions = async (pid: string, p: number, active: boolean) => {
    if (active) {
      const res = await prescriptionApi.getActiveByPatient(pid);
      setPrescriptions(res.content);
      setTotalPages(res.totalPages);
    } else {
      const res = await prescriptionApi.getByPatient(pid, p);
      setPrescriptions(res.content);
      setTotalPages(res.totalPages);
    }
  };

  const handlePageChange = useCallback(async (p: number) => {
    if (!patientId) return;
    setPage(p);
    setLoading(true);
    try { await loadPrescriptions(patientId, p, activeOnly); }
    finally { setLoading(false); }
  }, [patientId, activeOnly]);

  const toggleActiveOnly = async () => {
    if (!patientId) return;
    const next = !activeOnly;
    setActiveOnly(next);
    setPage(0);
    setLoading(true);
    try { await loadPrescriptions(patientId, 0, next); }
    finally { setLoading(false); }
  };

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      ACTIVE: 'badge-success', COMPLETED: 'badge-muted', CANCELLED: 'badge-danger',
    };
    return <span className={`badge ${cls[status] || 'badge-muted'}`}>{status}</span>;
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div><h1>Prescriptions</h1><p>Your medication history and active prescriptions</p></div>
        <button className={`btn ${activeOnly ? 'btn-primary' : 'btn-ghost'}`} onClick={toggleActiveOnly}>
          {activeOnly ? '✓ Active Only' : 'Show Active Only'}
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {prescriptions.length === 0 ? (
            <EmptyState message="No prescriptions found" />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date Issued</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Medications</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map(rx => (
                  <tr key={rx.id}>
                    <td>{rx.issueDate}</td>
                    <td>Dr. {rx.doctorName}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rx.diagnosis}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {rx.medications.slice(0, 2).map((m, i) => (
                          <span key={i} className="badge badge-info" style={{ fontSize: 11 }}>{m.name}</span>
                        ))}
                        {rx.medications.length > 2 && (
                          <span className="badge badge-muted" style={{ fontSize: 11 }}>+{rx.medications.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td>{rx.expiryDate || '—'}</td>
                    <td>{statusBadge(rx.status)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(rx)}>View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>

      {/* Prescription detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title="Prescription Details" maxWidth="620px">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Issued by Dr. {selected.doctorName}</div>
              <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>
                {selected.issueDate} {selected.expiryDate && `→ Expires ${selected.expiryDate}`}
              </div>
            </div>
            {statusBadge(selected.status)}
          </div>

          <div style={{ padding: 14, background: 'var(--clr-primary-light)', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-primary)', marginBottom: 4 }}>DIAGNOSIS</div>
            <div style={{ fontSize: 14 }}>{selected.diagnosis}</div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            Medications ({selected.medications.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selected.medications.map((med, i) => (
              <div key={i} style={{ padding: 14, border: '1px solid var(--clr-border)', borderRadius: 8, background: 'var(--clr-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>💊 {med.name}</div>
                  <span className="badge badge-info">{med.dosage}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600 }}>FREQUENCY</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{med.frequency}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600 }}>DURATION</div>
                    <div style={{ fontSize: 13, marginTop: 2 }}>{med.duration}</div>
                  </div>
                </div>
                {med.instructions && (
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>
                    ℹ️ {med.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selected.notes && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--clr-bg)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 4 }}>DOCTOR'S NOTES</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>{selected.notes}</div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
