import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/services';
import toast from 'react-hot-toast';
import type { Role } from '../../types';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    firstName: '', lastName: '', role: 'PATIENT' as Role,
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(form);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      toast.success('Account created! Welcome to HealthCare+');
      const path = form.role === 'PATIENT' ? '/patient' : form.role === 'ADMIN' ? '/admin' : '/doctor';
      navigate(path, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>✚</div>
          <h1>Join HealthCare+</h1>
          <p>Create your account to start managing your healthcare experience. Patients, doctors, and administrators are all welcome.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box" style={{ maxWidth: 480 }}>
          <div className="auth-logo">✚ Health<span>Care+</span></div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Create account</h2>
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: 28, fontSize: 14 }}>Fill in your details to get started.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" placeholder="John" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-control" placeholder="johndoe" value={form.username} onChange={set('username')} required minLength={3} />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="john@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={set('role') as any}>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px', fontSize: 14, marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--clr-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--clr-primary)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
