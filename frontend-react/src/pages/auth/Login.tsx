import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect
  if (user) {
    const path = user.role === 'PATIENT' ? '/patient' : user.role === 'ADMIN' ? '/admin' : '/doctor';
    navigate(path, { replace: true });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.usernameOrEmail, form.password);
      toast.success('Welcome back!');
      // redirect based on role (AuthContext updates user)
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const path = storedUser.role === 'PATIENT' ? '/patient' : storedUser.role === 'ADMIN' ? '/admin' : '/doctor';
      navigate(path, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>✚</div>
          <h1>HealthCare+</h1>
          <p>A comprehensive doctor–patient management platform. Manage appointments, prescriptions, and patient records all in one place.</p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '📅', text: 'Easy appointment scheduling' },
              { icon: '💊', text: 'Digital prescriptions & records' },
              { icon: '💳', text: 'Transparent billing & invoicing' },
              { icon: '📊', text: 'Real-time analytics dashboard' },
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', gap: 12, alignItems: 'center', color: 'rgba(200,216,228,.8)', fontSize: 14 }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>{f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-logo">✚ Health<span>Care+</span></div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Sign in</h2>
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: 28, fontSize: 14 }}>Enter your credentials to access the system.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                className="form-control"
                placeholder="you@example.com"
                value={form.usernameOrEmail}
                onChange={e => setForm(p => ({ ...p, usernameOrEmail: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px', fontSize: 14, marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--clr-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--clr-primary)', fontWeight: 500 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
