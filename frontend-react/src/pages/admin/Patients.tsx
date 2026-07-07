import { useState, useEffect, useCallback } from 'react';
import { patientApi } from '../../api/services';
import type { PatientResponse } from '../../types';
import { Spinner, EmptyState, PatientStatusBadge, Pagination, Confirm } from '../../components/UI';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPatients() {
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PatientResponse | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = q.length > 2
        ? await patientApi.search(q, p)
        : await patientApi.getAll(p);
      setPatients(res.content);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Failed to load patients');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, search); }, [page, search, load]);

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await patientApi.deactivate(deactivateTarget);
      toast.success('Patient deactivated');
      setDeactivateTarget(null);
      load(page, search);
    } catch { toast.error('Failed to deactivate'); }
    finally { setDeactivating(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Patients</h1>
          <p>Manage all registered patients</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ width: 300 }}>
            <Search size={20} />
            <input
              placeholder="Search by name, email, code…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <span style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>
            {patients.length} record{patients.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="table-wrapper">
          {loading ? <Spinner /> : patients.length === 0 ? <EmptyState message="No patients found" /> : (
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Code</th>
                  <th>Contact</th>
                  <th>Blood Type</th>
                  <th>Insurance</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.firstName} {p.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{p.email}</div>
                    </td>
                    <td><code style={{ fontSize: 12 }}>{p.patientCode}</code></td>
                    <td>{p.phone}</td>
                    <td>{p.bloodType || '—'}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.insuranceProvider}</td>
                    <td><PatientStatusBadge status={p.status} /></td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(p)}>View</button>
                        {p.status === 'ACTIVE' && (
                          <button className="btn btn-sm" style={{ background: 'var(--clr-danger-light)', color: 'var(--clr-danger)' }}
                            onClick={() => setDeactivateTarget(p.id)}>Deactivate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* Patient detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{selected.firstName} {selected.lastName}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item"><div className="info-label">Patient Code</div><div className="info-value">{selected.patientCode}</div></div>
                <div className="info-item"><div className="info-label">Email</div><div className="info-value">{selected.email}</div></div>
                <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{selected.phone}</div></div>
                <div className="info-item"><div className="info-label">Date of Birth</div><div className="info-value">{selected.dateOfBirth}</div></div>
                <div className="info-item"><div className="info-label">Gender</div><div className="info-value">{selected.gender}</div></div>
                <div className="info-item"><div className="info-label">Blood Type</div><div className="info-value">{selected.bloodType || '—'}</div></div>
                <div className="info-item"><div className="info-label">Status</div><div className="info-value"><PatientStatusBadge status={selected.status} /></div></div>
                <div className="info-item"><div className="info-label">Insurance</div><div className="info-value">{selected.insuranceProvider}</div></div>
                <div className="info-item"><div className="info-label">City</div><div className="info-value">{selected.city || '—'}</div></div>
                <div className="info-item"><div className="info-label">Country</div><div className="info-value">{selected.country}</div></div>
              </div>
              {selected.allergies && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--clr-warn-light)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-warn)', marginBottom: 4 }}>ALLERGIES</div>
                  <div style={{ fontSize: 13 }}>{selected.allergies}</div>
                </div>
              )}
              {selected.chronicConditions && (
                <div style={{ marginTop: 10, padding: 12, background: 'var(--clr-danger-light)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-danger)', marginBottom: 4 }}>CHRONIC CONDITIONS</div>
                  <div style={{ fontSize: 13 }}>{selected.chronicConditions}</div>
                </div>
              )}
              {selected.emergencyContactName && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 8 }}>EMERGENCY CONTACT</div>
                  <div style={{ fontSize: 13 }}>{selected.emergencyContactName} ({selected.emergencyContactRelation}) — {selected.emergencyContactPhone}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Confirm
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Patient"
        message="Are you sure you want to deactivate this patient? They will no longer be able to book appointments."
        danger
        loading={deactivating}
      />
    </div>
  );
}
