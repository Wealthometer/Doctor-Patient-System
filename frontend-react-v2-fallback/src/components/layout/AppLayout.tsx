import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { cn } from '../../utils';
import { Avatar } from '../common';
import {
  LayoutDashboard, Users, UserCog, Calendar, FileText,
  CreditCard, Bell, Settings, LogOut, Menu, X, Activity,
  Stethoscope, ClipboardList, ChevronDown,
} from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles?: string[];
}

const allNavItems: NavItem[] = [
  { to: 'dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" />, label: 'Dashboard' },
  { to: 'patients', icon: <Users className="w-4.5 h-4.5" />, label: 'Patients', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
  { to: 'doctors', icon: <Stethoscope className="w-4.5 h-4.5" />, label: 'Doctors', roles: ['ADMIN'] },
  { to: 'appointments', icon: <Calendar className="w-4.5 h-4.5" />, label: 'Appointments' },
  { to: 'prescriptions', icon: <ClipboardList className="w-4.5 h-4.5" />, label: 'Prescriptions' },
  { to: 'billing', icon: <CreditCard className="w-4.5 h-4.5" />, label: 'Billing', roles: ['ADMIN', 'DOCTOR', 'PATIENT'] },
  { to: 'profile', icon: <UserCog className="w-4.5 h-4.5" />, label: 'My Profile' },
];

export const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(s => s.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = allNavItems.filter(item =>
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-none">HealthCare</p>
            <p className="text-xs text-slate-400 mt-0.5">Management System</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Role Badge */}
        {user && (
          <div className="mx-4 mt-4 mb-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{user.role}</p>
            <p className="text-sm font-medium text-slate-800 truncate">{user.firstName} {user.lastName}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-5 gap-4 shrink-0">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-slate-500" />
          </button>
          <div className="flex-1" />
          <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-500" />
          </button>
          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors"
              >
                <Avatar name={`${user.firstName} ${user.lastName}`} size="sm" />
                <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.firstName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 z-20 w-48 bg-white rounded-xl border border-slate-200 shadow-lg py-1">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate('profile'); setProfileOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
