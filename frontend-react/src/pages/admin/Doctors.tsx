import { useState, useEffect, useCallback } from 'react';
import { doctorApi, authApi } from '../../api/services';
import type { DoctorResponse, DoctorStatus } from '../../types';
import { Spinner, EmptyState, DoctorStatusBadge, Pagination, Modal } from '../../components/UI';
import { Search, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DoctorResponse | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    // Auth
    username: '', email: '', password: '', firstName: '', lastName: '',
    // Doctor
    phone: '', specialization: '', department: '', licenseNumber: '',
    yearsOfExperience: '', consultationFee: '', bio: '',
  });

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const res = q.length > 2 ? await doctorApi.search(q, p) : await doctorApi.getAll(p);
      setDoctors(res.content);
      setTotalPages(res.totalPages);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, search); }, [page, search, load]);

  const handleStatusChange = async (id: string, status: DoctorStatus) => {
    try {
      await doctorApi.updateStatus(id, status);
      toast.success('Status updated');
      load(page, search);
    } catch { toast.error('Failed to update status'); }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      // 1. Register user account
      const authRes = await authApi.register({
        username: createForm.username, email: createForm.email,
        password: createForm.password, firstName: createForm.firstName,
        lastName: createForm.lastName, role: 'DOCTOR',
      });
      // 2. Create doctor profile
      await doctorApi.create({
        userId: authRes.user.id,
        firstName: createForm.firstName, lastName: createForm.lastName,
        email: createForm.email, phone: createForm.phone,
        specialization: createForm.specialization, department: createForm.department,
        licenseNumber: createForm.licenseNumber,
        yearsOfExperience: parseInt(createForm.yearsOfExperience) || 0,
        consultationFee: createForm.consultationFee, bio: createForm.bio,
      });
      toast.success('Doctor created successfully');
      setShowCreate(false);
      load(page, search);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create doctor');
    } finally { setCreating(false); }
  };

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCreateForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Doctors</h1>
          <p>Manage doctor profiles and accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Doctor</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ width: 300 }}>
            <Search size={20} />
            <input placeholder="Search doctors…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }} />
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? <Spinner /> : doctors.length === 0 ? <EmptyState message="No doctors found" /> : (
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Code</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>Dr. {d.firstName} {d.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{d.email}</div>
                    </td>
                    <td><code style={{ fontSize: 12 }}>{d.doctorCode}</code></td>
                    <td>{d.specialization}</td>
                    <td>{d.department}</td>
                    <td>{d.yearsOfExperience ? `${d.yearsOfExperience}y` : '—'}</td>
                    <td>{d.consultationFee ? `$${d.consultationFee}` : '—'}</td>
                    <td>
                      {d.averageRating
                        ? (<><Star size={20} /> {d.averageRating.toFixed(1)} <span style={{ fontSize: 11, color: 'var(--clr-text-muted)' }}>({d.totalRatings})</span></>)
                        : '—'}
                    </td>
                    <td><DoctorStatusBadge status={d.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelected(d)}>View</button>
                        <select
                          className="form-control"
                          style={{ padding: '3px 6px', fontSize: 12, width: 'auto' }}
                          value={d.status}
                          onChange={e => handleStatusChange(d.id, e.target.value as DoctorStatus)}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="ON_LEAVE">On Leave</option>
                        </select>
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

      {/* Doctor detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Dr. {selected.firstName} {selected.lastName}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item"><div className="info-label">Doctor Code</div><div className="info-value">{selected.doctorCode}</div></div>
                <div className="info-item"><div className="info-label">Email</div><div className="info-value">{selected.email}</div></div>
                <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{selected.phone}</div></div>
                <div className="info-item"><div className="info-label">Specialization</div><div className="info-value">{selected.specialization}</div></div>
                <div className="info-item"><div className="info-label">Department</div><div className="info-value">{selected.department}</div></div>
                <div className="info-item"><div className="info-label">License</div><div className="info-value">{selected.licenseNumber}</div></div>
                <div className="info-item"><div className="info-label">Experience</div><div className="info-value">{selected.yearsOfExperience ? `${selected.yearsOfExperience} years` : '—'}</div></div>
                <div className="info-item"><div className="info-label">Consultation Fee</div><div className="info-value">{selected.consultationFee ? `$${selected.consultationFee}` : '—'}</div></div>
                <div className="info-item"><div className="info-label">Work Hours</div><div className="info-value">{selected.workStartTime && selected.workEndTime ? `${selected.workStartTime} – ${selected.workEndTime}` : '—'}</div></div>
                <div className="info-item"><div className="info-label">Max Daily Appts</div><div className="info-value">{selected.maxDailyAppointments || '—'}</div></div>
              </div>
              {selected.bio && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 6 }}>BIO</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--clr-text)' }}>{selected.bio}</p>
                </div>
              )}
              {selected.qualifications && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 6 }}>QUALIFICATIONS</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6 }}>{selected.qualifications}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Doctor modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add New Doctor" maxWidth="640px"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating…' : 'Create Doctor'}
          </button>
        </>}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Account Details</div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={createForm.firstName} onChange={setField('firstName')} /></div>
          <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={createForm.lastName} onChange={setField('lastName')} /></div>
          <div className="form-group"><label className="form-label">Username</label><input className="form-control" value={createForm.username} onChange={setField('username')} /></div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={createForm.email} onChange={setField('email')} /></div>
        </div>
        <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-control" value={createForm.password} onChange={setField('password')} /></div>

        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', margin: '16px 0 12px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Professional Details</div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={createForm.phone} onChange={setField('phone')} /></div>
          <div className="form-group"><label className="form-label">License Number</label><input className="form-control" value={createForm.licenseNumber} onChange={setField('licenseNumber')} /></div>
          <div className="form-group"><label className="form-label">Specialization</label><input className="form-control" value={createForm.specialization} onChange={setField('specialization')} /></div>
          <div className="form-group"><label className="form-label">Department</label><input className="form-control" value={createForm.department} onChange={setField('department')} /></div>
          <div className="form-group"><label className="form-label">Years of Experience</label><input type="number" className="form-control" value={createForm.yearsOfExperience} onChange={setField('yearsOfExperience')} /></div>
          <div className="form-group"><label className="form-label">Consultation Fee ($)</label><input className="form-control" value={createForm.consultationFee} onChange={setField('consultationFee')} /></div>
        </div>
        <div className="form-group"><label className="form-label">Bio</label><textarea className="form-control" rows={3} value={createForm.bio} onChange={setField('bio')} /></div>
      </Modal>
    </div>
  );
}
