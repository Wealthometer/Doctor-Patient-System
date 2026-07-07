import { useState, useEffect } from 'react';
import { authApi } from '../../api/services';
import type { UserInfo, Role } from '../../types';
import { Spinner, EmptyState, Modal } from '../../components/UI';
import { Users, Stethoscope, Settings, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', password: '', firstName: '', lastName: '', role: 'PATIENT' as Role,
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async () => {
    setCreating(true);
    try {
      await authApi.register(form);
      toast.success(`${form.role} account created for ${form.firstName} ${form.lastName}`);
      setShowCreate(false);
      setForm({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'PATIENT' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    } finally { setCreating(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Create and manage system user accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create User</button>
      </div>

      {/* Info panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { role: 'PATIENT', icon: <Users size={24} />, desc: 'Can book appointments, view prescriptions and invoices, manage their health profile.', color: 'var(--clr-primary)' },
          { role: 'DOCTOR', icon: <Stethoscope size={24} />, desc: 'Can manage appointments, write prescriptions, view patient records.', color: 'var(--clr-accent)' },
          { role: 'ADMIN', icon: <Settings size={24} />, desc: 'Full system access — manage users, view all records, configure system.', color: 'var(--clr-warn)' },
        ].map(r => (
          <div key={r.role} className="card">
            <div className="card-body">
              <div style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: 6, color: r.color }}>{r.role}</div>
              <p style={{ fontSize: 12.5, color: 'var(--clr-text-muted)', lineHeight: 1.6 }}>{r.desc}</p>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }}
                onClick={() => { setForm(p => ({ ...p, role: r.role as Role })); setShowCreate(true); }}>
                + Create {r.role}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Password policy info */}
      <div className="card">
        <div className="card-header"><span className="card-title">Account Policies</span></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { label: 'Password Minimum Length', value: '8 characters' },
              { label: 'JWT Token Expiry', value: 'Configured in auth-service' },
              { label: 'Registration', value: 'Open (any role via /api/v1/auth/register)' },
              { label: 'Role Elevation', value: 'Admin only via this panel' },
            ].map(item => (
              <div key={item.label} style={{ padding: '12px 16px', background: 'var(--clr-bg)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 4 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: 13 }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--clr-warn-light)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--clr-warn)', fontWeight: 600, marginBottom: 4 }}><Info size={20} /> NOTE</div>
            <p style={{ fontSize: 13, color: 'var(--clr-text)', lineHeight: 1.6 }}>
              After creating a Doctor account, go to <strong>Doctor Management</strong> to create their doctor profile.
              After creating a Patient account, the patient can complete their profile from their dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Create user modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New User Account" maxWidth="520px"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating…' : 'Create Account'}
          </button>
        </>}>

        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Account Role</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 6 }}>
            {(['PATIENT', 'DOCTOR', 'ADMIN'] as Role[]).map(r => (
              <div key={r}
                onClick={() => setForm(p => ({ ...p, role: r }))}
                style={{
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${form.role === r ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                  background: form.role === r ? 'var(--clr-primary-light)' : 'transparent',
                  fontSize: 13, fontWeight: 500,
                  color: form.role === r ? 'var(--clr-primary)' : 'var(--clr-text-muted)',
                  transition: 'all .15s',
                }}>
                {r === 'PATIENT' ? '👥' : r === 'DOCTOR' ? '🩺' : '⚙️'} {r}
              </div>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input className="form-control" placeholder="John" value={form.firstName} onChange={set('firstName')} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input className="form-control" placeholder="Doe" value={form.lastName} onChange={set('lastName')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Username *</label>
          <input className="form-control" placeholder="johndoe" value={form.username} onChange={set('username')} />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input type="email" className="form-control" placeholder="john@example.com" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-group">
          <label className="form-label">Temporary Password *</label>
          <input type="password" className="form-control" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} minLength={8} />
          <div className="form-hint">The user should change this on first login.</div>
        </div>
      </Modal>
    </div>
  );
}
