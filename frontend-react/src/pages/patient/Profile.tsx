import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientApi, authApi } from '../../api/services';
import type { PatientResponse, Gender } from '../../types';
import { Spinner, Modal } from '../../components/UI';
import toast from 'react-hot-toast';

const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const [editForm, setEditForm] = useState<any>({});
  const [createForm, setCreateForm] = useState<any>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '', dateOfBirth: '', gender: 'MALE',
    address: '', city: '', state: '', zipCode: '', country: 'US',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    allergies: '', chronicConditions: '', bloodType: '', medicalNotes: '',
    insuranceProvider: '', insurancePolicyNumber: '',
  });

  useEffect(() => {
    if (!user) return;
    patientApi.getByUserId(user.id)
      .then(p => {
        setPatient(p);
        setEditForm({
          firstName: p.firstName, lastName: p.lastName, phone: p.phone,
          address: p.address, city: p.city, state: p.state, zipCode: p.zipCode, country: p.country,
          emergencyContactName: p.emergencyContactName, emergencyContactPhone: p.emergencyContactPhone,
          emergencyContactRelation: p.emergencyContactRelation,
          allergies: p.allergies, chronicConditions: p.chronicConditions,
          bloodType: p.bloodType, medicalNotes: p.medicalNotes,
          insuranceProvider: p.insuranceProvider, insurancePolicyNumber: p.insurancePolicyNumber,
        });
      })
      .catch(() => setShowCreateModal(true))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!patient) return;
    setSaving(true);
    try {
      const updated = await patientApi.update(patient.id, editForm);
      setPatient(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleCreate = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const p = await patientApi.create({ ...createForm, userId: user.id });
      setPatient(p);
      setShowCreateModal(false);
      toast.success('Patient profile created!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create profile');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch { toast.error('Failed to change password'); }
    finally { setPwSaving(false); }
  };

  const setEdit = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setEditForm((p: any) => ({ ...p, [k]: e.target.value }));
  const setCreate = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setCreateForm((p: any) => ({ ...p, [k]: e.target.value }));

  if (loading) return <Spinner />;

  if (!patient && !showCreateModal) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', marginBottom: 8 }}>No profile found</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create Patient Profile</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>My Profile</h1><p>Manage your personal and medical information</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => setShowPasswordModal(true)}>🔒 Change Password</button>
          {!editing ? (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </>
          )}
        </div>
      </div>

      {patient && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          {/* Left: summary card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px',
                  background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 26, fontWeight: 700,
                }}>
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{patient.firstName} {patient.lastName}</div>
                <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 4 }}>{patient.patientCode}</div>
                <span className="badge badge-success" style={{ marginTop: 10 }}>{patient.status}</span>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">Medical Summary</span></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="info-item"><div className="info-label">Blood Type</div><div className="info-value">{patient.bloodType || '—'}</div></div>
                <div className="info-item"><div className="info-label">Date of Birth</div><div className="info-value">{patient.dateOfBirth}</div></div>
                <div className="info-item"><div className="info-label">Gender</div><div className="info-value">{patient.gender}</div></div>
                {patient.allergies && (
                  <div style={{ padding: 8, background: 'var(--clr-warn-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--clr-warn)' }}>ALLERGIES</div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>{patient.allergies}</div>
                  </div>
                )}
                {patient.chronicConditions && (
                  <div style={{ padding: 8, background: 'var(--clr-danger-light)', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--clr-danger)' }}>CHRONIC CONDITIONS</div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>{patient.chronicConditions}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: editable details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Personal info */}
            <div className="card">
              <div className="card-header"><span className="card-title">Personal Information</span></div>
              <div className="card-body">
                {!editing ? (
                  <div className="info-grid">
                    <div className="info-item"><div className="info-label">First Name</div><div className="info-value">{patient.firstName}</div></div>
                    <div className="info-item"><div className="info-label">Last Name</div><div className="info-value">{patient.lastName}</div></div>
                    <div className="info-item"><div className="info-label">Email</div><div className="info-value">{patient.email}</div></div>
                    <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{patient.phone}</div></div>
                    <div className="info-item"><div className="info-label">Address</div><div className="info-value">{patient.address || '—'}</div></div>
                    <div className="info-item"><div className="info-label">City</div><div className="info-value">{patient.city || '—'}</div></div>
                    <div className="info-item"><div className="info-label">State</div><div className="info-value">{patient.state || '—'}</div></div>
                    <div className="info-item"><div className="info-label">Country</div><div className="info-value">{patient.country}</div></div>
                  </div>
                ) : (
                  <>
                    <div className="form-grid">
                      <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={editForm.firstName} onChange={setEdit('firstName')} /></div>
                      <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={editForm.lastName} onChange={setEdit('lastName')} /></div>
                      <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={editForm.phone} onChange={setEdit('phone')} /></div>
                      <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={editForm.address} onChange={setEdit('address')} /></div>
                      <div className="form-group"><label className="form-label">City</label><input className="form-control" value={editForm.city} onChange={setEdit('city')} /></div>
                      <div className="form-group"><label className="form-label">State</label><input className="form-control" value={editForm.state} onChange={setEdit('state')} /></div>
                      <div className="form-group"><label className="form-label">ZIP Code</label><input className="form-control" value={editForm.zipCode} onChange={setEdit('zipCode')} /></div>
                      <div className="form-group"><label className="form-label">Country</label><input className="form-control" value={editForm.country} onChange={setEdit('country')} /></div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Emergency contact */}
            <div className="card">
              <div className="card-header"><span className="card-title">Emergency Contact</span></div>
              <div className="card-body">
                {!editing ? (
                  <div className="info-grid">
                    <div className="info-item"><div className="info-label">Name</div><div className="info-value">{patient.emergencyContactName || '—'}</div></div>
                    <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{patient.emergencyContactPhone || '—'}</div></div>
                    <div className="info-item"><div className="info-label">Relation</div><div className="info-value">{patient.emergencyContactRelation || '—'}</div></div>
                  </div>
                ) : (
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Name</label><input className="form-control" value={editForm.emergencyContactName} onChange={setEdit('emergencyContactName')} /></div>
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={editForm.emergencyContactPhone} onChange={setEdit('emergencyContactPhone')} /></div>
                    <div className="form-group"><label className="form-label">Relation</label><input className="form-control" value={editForm.emergencyContactRelation} onChange={setEdit('emergencyContactRelation')} /></div>
                  </div>
                )}
              </div>
            </div>

            {/* Medical info */}
            <div className="card">
              <div className="card-header"><span className="card-title">Medical Information</span></div>
              <div className="card-body">
                {!editing ? (
                  <div className="info-grid">
                    <div className="info-item"><div className="info-label">Blood Type</div><div className="info-value">{patient.bloodType || '—'}</div></div>
                    <div className="info-item"><div className="info-label">Insurance Provider</div><div className="info-value">{patient.insuranceProvider}</div></div>
                    <div className="info-item"><div className="info-label">Insurance Policy #</div><div className="info-value">{patient.insurancePolicyNumber || '—'}</div></div>
                    <div className="info-item" style={{ gridColumn: '1/-1' }}><div className="info-label">Allergies</div><div className="info-value">{patient.allergies || 'None reported'}</div></div>
                    <div className="info-item" style={{ gridColumn: '1/-1' }}><div className="info-label">Chronic Conditions</div><div className="info-value">{patient.chronicConditions || 'None reported'}</div></div>
                    <div className="info-item" style={{ gridColumn: '1/-1' }}><div className="info-label">Medical Notes</div><div className="info-value">{patient.medicalNotes || '—'}</div></div>
                  </div>
                ) : (
                  <div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Blood Type</label>
                        <select className="form-control" value={editForm.bloodType} onChange={setEdit('bloodType')}>
                          <option value="">Select…</option>
                          {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                        </select>
                      </div>
                      <div className="form-group"><label className="form-label">Insurance Provider</label><input className="form-control" value={editForm.insuranceProvider} onChange={setEdit('insuranceProvider')} /></div>
                      <div className="form-group"><label className="form-label">Policy Number</label><input className="form-control" value={editForm.insurancePolicyNumber} onChange={setEdit('insurancePolicyNumber')} /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Allergies</label><textarea className="form-control" rows={2} value={editForm.allergies} onChange={setEdit('allergies')} /></div>
                    <div className="form-group"><label className="form-label">Chronic Conditions</label><textarea className="form-control" rows={2} value={editForm.chronicConditions} onChange={setEdit('chronicConditions')} /></div>
                    <div className="form-group"><label className="form-label">Medical Notes</label><textarea className="form-control" rows={3} value={editForm.medicalNotes} onChange={setEdit('medicalNotes')} /></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create profile modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Patient Profile" maxWidth="640px"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Profile'}</button>
        </>}>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">First Name *</label><input className="form-control" value={createForm.firstName} onChange={setCreate('firstName')} /></div>
          <div className="form-group"><label className="form-label">Last Name *</label><input className="form-control" value={createForm.lastName} onChange={setCreate('lastName')} /></div>
          <div className="form-group"><label className="form-label">Email *</label><input type="email" className="form-control" value={createForm.email} onChange={setCreate('email')} /></div>
          <div className="form-group"><label className="form-label">Phone *</label><input className="form-control" value={createForm.phone} onChange={setCreate('phone')} /></div>
          <div className="form-group"><label className="form-label">Date of Birth *</label><input type="date" className="form-control" value={createForm.dateOfBirth} onChange={setCreate('dateOfBirth')} /></div>
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <select className="form-control" value={createForm.gender} onChange={setCreate('gender')}>
              {GENDERS.map(g => <option key={g} value={g}>{g.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Blood Type</label>
            <select className="form-control" value={createForm.bloodType} onChange={setCreate('bloodType')}>
              <option value="">Select…</option>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Insurance Provider *</label><input className="form-control" value={createForm.insuranceProvider} onChange={setCreate('insuranceProvider')} /></div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={createForm.address} onChange={setCreate('address')} /></div>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">City</label><input className="form-control" value={createForm.city} onChange={setCreate('city')} /></div>
          <div className="form-group"><label className="form-label">State</label><input className="form-control" value={createForm.state} onChange={setCreate('state')} /></div>
        </div>
        <div className="form-group"><label className="form-label">Allergies</label><textarea className="form-control" rows={2} value={createForm.allergies} onChange={setCreate('allergies')} placeholder="List any known allergies…" /></div>
        <div className="form-group"><label className="form-label">Chronic Conditions</label><textarea className="form-control" rows={2} value={createForm.chronicConditions} onChange={setCreate('chronicConditions')} /></div>
      </Modal>

      {/* Password modal */}
      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowPasswordModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handlePasswordChange} disabled={pwSaving}>{pwSaving ? 'Updating…' : 'Update Password'}</button>
        </>}>
        <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-control" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-control" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} /></div>
        <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-control" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} /></div>
      </Modal>
    </div>
  );
}
