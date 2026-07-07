import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, authApi } from '../../api/services';
import type { DoctorResponse } from '../../types';
import { Spinner, Modal } from '../../components/UI';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    if (!user) return;
    doctorApi.getByUserId(user.id)
      .then(d => {
        setDoctor(d);
        setEditForm({
          firstName: d.firstName, lastName: d.lastName, phone: d.phone,
          specialization: d.specialization, department: d.department,
          bio: d.bio, qualifications: d.qualifications,
          yearsOfExperience: d.yearsOfExperience, consultationFee: d.consultationFee,
          workStartTime: d.workStartTime, workEndTime: d.workEndTime,
          workDays: d.workDays, maxDailyAppointments: d.maxDailyAppointments,
        });
      })
      .catch(() => toast.error('Could not load profile'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async () => {
    if (!doctor) return;
    setSaving(true);
    try {
      const updated = await doctorApi.update(doctor.id, editForm);
      setDoctor(updated);
      setEditing(false);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setPwSaving(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated');
      setShowPasswordModal(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch { toast.error('Failed to change password'); }
    finally { setPwSaving(false); }
  };

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm((p: any) => ({ ...p, [k]: e.target.value }));

  if (loading) return <Spinner />;
  if (!doctor) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <p style={{ color: 'var(--clr-text-muted)' }}>Doctor profile not found. Contact admin.</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div><h1>My Profile</h1><p>Your professional information and settings</p></div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 14px',
                background: 'linear-gradient(135deg, var(--clr-primary), var(--clr-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 28, fontWeight: 700,
              }}>
                {doctor.firstName[0]}{doctor.lastName[0]}
              </div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>Dr. {doctor.firstName} {doctor.lastName}</div>
              <div style={{ fontSize: 13, color: 'var(--clr-text-muted)', marginTop: 4 }}>{doctor.specialization}</div>
              <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{doctor.department}</div>
              <div style={{ marginTop: 10 }}>
                <span className={`badge ${doctor.status === 'ACTIVE' ? 'badge-success' : doctor.status === 'ON_LEAVE' ? 'badge-warn' : 'badge-muted'}`}>
                  {doctor.status.replace('_', ' ')}
                </span>
              </div>
              {doctor.averageRating && (
                <div style={{ marginTop: 12, fontSize: 14 }}>
                  <Star size={20} /> {doctor.averageRating.toFixed(1)}
                  <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}> ({doctor.totalRatings} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="info-item"><div className="info-label">Doctor Code</div><div className="info-value" style={{ fontFamily: 'monospace' }}>{doctor.doctorCode}</div></div>
              <div className="info-item"><div className="info-label">License #</div><div className="info-value">{doctor.licenseNumber}</div></div>
              {doctor.licenseExpiryDate && <div className="info-item"><div className="info-label">License Expires</div><div className="info-value">{doctor.licenseExpiryDate}</div></div>}
              <div className="info-item"><div className="info-label">Experience</div><div className="info-value">{doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : '—'}</div></div>
              <div className="info-item"><div className="info-label">Consultation Fee</div><div className="info-value">{doctor.consultationFee ? `$${doctor.consultationFee}` : '—'}</div></div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Contact */}
          <div className="card">
            <div className="card-header"><span className="card-title">Contact Information</span></div>
            <div className="card-body">
              {!editing ? (
                <div className="info-grid">
                  <div className="info-item"><div className="info-label">First Name</div><div className="info-value">{doctor.firstName}</div></div>
                  <div className="info-item"><div className="info-label">Last Name</div><div className="info-value">{doctor.lastName}</div></div>
                  <div className="info-item"><div className="info-label">Email</div><div className="info-value">{doctor.email}</div></div>
                  <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{doctor.phone}</div></div>
                </div>
              ) : (
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={editForm.firstName} onChange={setField('firstName')} /></div>
                  <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={editForm.lastName} onChange={setField('lastName')} /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={editForm.phone} onChange={setField('phone')} /></div>
                </div>
              )}
            </div>
          </div>

          {/* Professional */}
          <div className="card">
            <div className="card-header"><span className="card-title">Professional Information</span></div>
            <div className="card-body">
              {!editing ? (
                <div>
                  <div className="info-grid" style={{ marginBottom: 16 }}>
                    <div className="info-item"><div className="info-label">Specialization</div><div className="info-value">{doctor.specialization}</div></div>
                    <div className="info-item"><div className="info-label">Department</div><div className="info-value">{doctor.department}</div></div>
                    <div className="info-item"><div className="info-label">Work Hours</div><div className="info-value">{doctor.workStartTime && doctor.workEndTime ? `${doctor.workStartTime} – ${doctor.workEndTime}` : '—'}</div></div>
                    <div className="info-item"><div className="info-label">Work Days</div><div className="info-value">{doctor.workDays || '—'}</div></div>
                    <div className="info-item"><div className="info-label">Max Daily Appointments</div><div className="info-value">{doctor.maxDailyAppointments || '—'}</div></div>
                    <div className="info-item"><div className="info-label">Consultation Fee</div><div className="info-value">{doctor.consultationFee ? `$${doctor.consultationFee}` : '—'}</div></div>
                  </div>
                  {doctor.bio && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 6 }}>BIO</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6 }}>{doctor.bio}</p>
                    </div>
                  )}
                  {doctor.qualifications && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 6 }}>QUALIFICATIONS</div>
                      <p style={{ fontSize: 13, lineHeight: 1.6 }}>{doctor.qualifications}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Specialization</label><input className="form-control" value={editForm.specialization} onChange={setField('specialization')} /></div>
                    <div className="form-group"><label className="form-label">Department</label><input className="form-control" value={editForm.department} onChange={setField('department')} /></div>
                    <div className="form-group"><label className="form-label">Work Start Time</label><input type="time" className="form-control" value={editForm.workStartTime} onChange={setField('workStartTime')} /></div>
                    <div className="form-group"><label className="form-label">Work End Time</label><input type="time" className="form-control" value={editForm.workEndTime} onChange={setField('workEndTime')} /></div>
                    <div className="form-group"><label className="form-label">Work Days</label><input className="form-control" placeholder="e.g. Monday-Friday" value={editForm.workDays} onChange={setField('workDays')} /></div>
                    <div className="form-group"><label className="form-label">Max Daily Appointments</label><input type="number" className="form-control" value={editForm.maxDailyAppointments} onChange={setField('maxDailyAppointments')} /></div>
                    <div className="form-group"><label className="form-label">Consultation Fee ($)</label><input className="form-control" value={editForm.consultationFee} onChange={setField('consultationFee')} /></div>
                    <div className="form-group"><label className="form-label">Years of Experience</label><input type="number" className="form-control" value={editForm.yearsOfExperience} onChange={setField('yearsOfExperience')} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Bio</label><textarea className="form-control" rows={3} value={editForm.bio} onChange={setField('bio')} /></div>
                  <div className="form-group"><label className="form-label">Qualifications</label><textarea className="form-control" rows={3} value={editForm.qualifications} onChange={setField('qualifications')} /></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
