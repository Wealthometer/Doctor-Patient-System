import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, prescriptionApi, patientApi } from '../../api/services';
import type { Prescription, Medication, PatientResponse } from '../../types';
import { Spinner, EmptyState, Pagination, Modal } from '../../components/UI';
import toast from 'react-hot-toast';

const emptyMed = (): Medication => ({ name: '', dosage: '', frequency: '', duration: '', instructions: '' });

export default function DoctorPrescriptions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<PatientResponse[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    diagnosis: '', notes: '', expiryDate: '',
    medications: [emptyMed()],
  });

  useEffect(() => {
    if (!user) return;
    doctorApi.getByUserId(user.id)
      .then(d => {
        setDoctorId(d.id);
        return loadPrescriptions(d.id, 0);
      })
      .catch(() => toast.error('Could not load doctor profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const loadPrescriptions = async (did: string, p: number) => {
    const res = await prescriptionApi.getByDoctor(did, p);
    setPrescriptions(res.content);
    setTotalPages(res.totalPages);
  };

  const handlePageChange = useCallback(async (p: number) => {
    if (!doctorId) return;
    setPage(p);
    setLoading(true);
    try { await loadPrescriptions(doctorId, p); }
    finally { setLoading(false); }
  }, [doctorId]);

  const handlePatientSearch = async (q: string) => {
    setPatientSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await patientApi.search(q);
      setSearchResults(res.content.slice(0, 5));
    } catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  };

  const handleCreate = async () => {
    if (!doctorId || !selectedPatient) return;
    // Validate medications
    const validMeds = createForm.medications.filter(m => m.name && m.dosage && m.frequency && m.duration);
    if (validMeds.length === 0) { toast.error('Add at least one complete medication'); return; }
    if (!createForm.diagnosis) { toast.error('Diagnosis is required'); return; }

    setCreating(true);
    try {
      await prescriptionApi.create({
        patientId: selectedPatient.id,
        doctorId,
        medications: validMeds,
        diagnosis: createForm.diagnosis,
        notes: createForm.notes,
        expiryDate: createForm.expiryDate || undefined,
      });
      toast.success('Prescription created successfully');
      setShowCreate(false);
      setSelectedPatient(null);
      setPatientSearch('');
      setCreateForm({ diagnosis: '', notes: '', expiryDate: '', medications: [emptyMed()] });
      if (doctorId) await loadPrescriptions(doctorId, 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create prescription');
    } finally { setCreating(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this prescription?')) return;
    try {
      await prescriptionApi.cancel(id);
      toast.success('Prescription cancelled');
      if (doctorId) await loadPrescriptions(doctorId, page);
    } catch { toast.error('Failed to cancel'); }
  };

  const updateMed = (i: number, field: keyof Medication, value: string) => {
    setCreateForm(prev => {
      const meds = [...prev.medications];
      meds[i] = { ...meds[i], [field]: value };
      return { ...prev, medications: meds };
    });
  };
  const addMed = () => setCreateForm(prev => ({ ...prev, medications: [...prev.medications, emptyMed()] }));
  const removeMed = (i: number) => setCreateForm(prev => ({ ...prev, medications: prev.medications.filter((_, idx) => idx !== i) }));

  const statusBadge = (s: string) => {
    const cls: Record<string, string> = { ACTIVE: 'badge-success', COMPLETED: 'badge-muted', CANCELLED: 'badge-danger' };
    return <span className={`badge ${cls[s] || 'badge-muted'}`}>{s}</span>;
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div><h1>Prescriptions</h1><p>Issue and manage patient prescriptions</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Prescription</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {prescriptions.length === 0 ? (
            <EmptyState message="No prescriptions issued yet" />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
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
                    <td>{rx.patientName}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rx.diagnosis}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {rx.medications.slice(0, 2).map((m, i) => (
                          <span key={i} className="badge badge-info" style={{ fontSize: 11 }}>{m.name}</span>
                        ))}
                        {rx.medications.length > 2 && <span className="badge badge-muted" style={{ fontSize: 11 }}>+{rx.medications.length - 2}</span>}
                      </div>
                    </td>
                    <td>{rx.expiryDate || '—'}</td>
                    <td>{statusBadge(rx.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(rx)}>View</button>
                        {rx.status === 'ACTIVE' && (
                          <button className="btn btn-sm" style={{ background: 'var(--clr-danger-light)', color: 'var(--clr-danger)' }}
                            onClick={() => handleCancel(rx.id)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title="Prescription Details" maxWidth="620px">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{selected.patientName}</div>
              <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>Issued: {selected.issueDate} {selected.expiryDate && `• Expires: ${selected.expiryDate}`}</div>
            </div>
            {statusBadge(selected.status)}
          </div>
          <div style={{ padding: 12, background: 'var(--clr-primary-light)', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-primary)' }}>DIAGNOSIS</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>{selected.diagnosis}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 10 }}>MEDICATIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selected.medications.map((m, i) => (
              <div key={i} style={{ padding: 12, border: '1px solid var(--clr-border)', borderRadius: 8 }}>
                <div style={{ fontWeight: 600 }}>💊 {m.name} — <span className="badge badge-info">{m.dosage}</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  <div><div style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>FREQUENCY</div><div style={{ fontSize: 13 }}>{m.frequency}</div></div>
                  <div><div style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>DURATION</div><div style={{ fontSize: 13 }}>{m.duration}</div></div>
                </div>
                {m.instructions && <div style={{ marginTop: 8, fontSize: 12, fontStyle: 'italic', color: 'var(--clr-text-muted)' }}>{m.instructions}</div>}
              </div>
            ))}
          </div>
          {selected.notes && (
            <div style={{ marginTop: 14, padding: 10, background: 'var(--clr-bg)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--clr-text-muted)' }}>NOTES</div>
              <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>{selected.notes}</div>
            </div>
          )}
        </Modal>
      )}

      {/* Create prescription modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setSelectedPatient(null); setPatientSearch(''); }} title="New Prescription" maxWidth="680px"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating || !selectedPatient}>
            {creating ? 'Creating…' : 'Issue Prescription'}
          </button>
        </>}>

        {/* Patient search */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">Patient <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          {selectedPatient ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid var(--clr-accent)', borderRadius: 8, background: 'var(--clr-accent-light)' }}>
              <span style={{ fontWeight: 500 }}>{selectedPatient.firstName} {selectedPatient.lastName}</span>
              <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{selectedPatient.patientCode}</span>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}>✕</button>
            </div>
          ) : (
            <>
              <input className="form-control" placeholder="Search patient by name or code…"
                value={patientSearch} onChange={e => handlePatientSearch(e.target.value)} />
              {searchLoading && <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>Searching…</div>}
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', zIndex: 10, top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--clr-border)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                  {searchResults.map(p => (
                    <div key={p.id} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--clr-border)' }}
                      onClick={() => { setSelectedPatient(p); setSearchResults([]); setPatientSearch(''); }}>
                      <span style={{ fontWeight: 500 }}>{p.firstName} {p.lastName}</span>
                      <span style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginLeft: 8 }}>{p.patientCode}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Diagnosis <span style={{ color: 'var(--clr-danger)' }}>*</span></label>
          <textarea className="form-control" rows={2} value={createForm.diagnosis}
            onChange={e => setCreateForm(p => ({ ...p, diagnosis: e.target.value }))}
            placeholder="Enter diagnosis…" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--clr-text-muted)' }}>MEDICATIONS</div>
          <button className="btn btn-ghost btn-sm" onClick={addMed}>+ Add Medication</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {createForm.medications.map((med, i) => (
            <div key={i} style={{ padding: 14, border: '1px solid var(--clr-border)', borderRadius: 8, background: 'var(--clr-bg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Medication {i + 1}</div>
                {createForm.medications.length > 1 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => removeMed(i)} style={{ color: 'var(--clr-danger)' }}>Remove</button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Drug Name *</label><input className="form-control" placeholder="e.g. Amoxicillin" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Dosage *</label><input className="form-control" placeholder="e.g. 500mg" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Frequency *</label><input className="form-control" placeholder="e.g. 3 times daily" value={med.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Duration *</label><input className="form-control" placeholder="e.g. 7 days" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} /></div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Instructions</label>
                <input className="form-control" placeholder="e.g. Take with food" value={med.instructions} onChange={e => updateMed(i, 'instructions', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="form-grid" style={{ marginTop: 14 }}>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input type="date" className="form-control" value={createForm.expiryDate}
              onChange={e => setCreateForm(p => ({ ...p, expiryDate: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Additional Notes</label>
          <textarea className="form-control" rows={2} value={createForm.notes}
            onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Follow-up instructions, warnings…" />
        </div>
      </Modal>
    </div>
  );
}
