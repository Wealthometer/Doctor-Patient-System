import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';
import { LayoutDashboard, Calendar, Package, CreditCard, Search, User, Users, Stethoscope, Settings, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const PATIENT_NAV: NavItem[] = [
  { to: '/patient', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/patient/appointments', label: 'Appointments', icon: <Calendar size={16} /> },
  { to: '/patient/prescriptions', label: 'Prescriptions', icon: <Package size={16} /> },
  { to: '/patient/billing', label: 'Billing', icon: <CreditCard size={16} /> },
  { to: '/patient/doctors', label: 'Find Doctors', icon: <Search size={16} /> },
  { to: '/patient/profile', label: 'My Profile', icon: <User size={16} /> },
];

const DOCTOR_NAV: NavItem[] = [
  { to: '/doctor', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/doctor/appointments', label: 'Appointments', icon: <Calendar size={16} /> },
  { to: '/doctor/patients', label: 'My Patients', icon: <Users size={16} /> },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: <Package size={16} /> },
  { to: '/doctor/profile', label: 'My Profile', icon: <User size={16} /> },
];

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/admin/patients', label: 'Patients', icon: <User size={16} /> },
  { to: '/admin/doctors', label: 'Doctors', icon: <Stethoscope size={16} /> },
  { to: '/admin/appointments', label: 'Appointments', icon: <Calendar size={16} /> },
  { to: '/admin/billing', label: 'Billing', icon: <CreditCard size={16} /> },
  { to: '/admin/users', label: 'Users', icon: <Settings size={16} /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    user?.role === 'PATIENT' ? PATIENT_NAV :
    user?.role === 'DOCTOR' || user?.role === 'NURSE' ? DOCTOR_NAV :
    ADMIN_NAV;

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon"><Plus size={20} /></div>
          <div>
            <div className="logo-text">HealthCare+</div>
            <div className="logo-sub">Management System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.split('/').length === 2}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'rgba(200,216,228,.5)', cursor: 'pointer', padding: 4, fontSize: 16 }}
            title="Sign out"
          ><LogOut size={20} /></button>
        </div>
      </div>
    </aside>
  );
}
