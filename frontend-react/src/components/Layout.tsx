import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/patient': 'Patient Dashboard',
  '/patient/appointments': 'My Appointments',
  '/patient/prescriptions': 'Prescriptions',
  '/patient/billing': 'Billing & Invoices',
  '/patient/doctors': 'Find Doctors',
  '/patient/profile': 'My Profile',
  '/doctor': 'Doctor Dashboard',
  '/doctor/appointments': 'Appointments',
  '/doctor/patients': 'My Patients',
  '/doctor/prescriptions': 'Prescriptions',
  '/doctor/profile': 'My Profile',
  '/admin': 'Admin Dashboard',
  '/admin/patients': 'Patient Management',
  '/admin/doctors': 'Doctor Management',
  '/admin/appointments': 'All Appointments',
  '/admin/billing': 'Billing Management',
  '/admin/users': 'User Management',
};

export default function Layout() {
  const loc = useLocation();
  const title = PAGE_TITLES[loc.pathname] || 'HealthCare+';

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-actions">
            <span style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
