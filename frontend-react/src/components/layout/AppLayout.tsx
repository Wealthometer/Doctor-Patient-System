import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutThunk } from '@/store/slices/authSlice';
import {
  LayoutDashboard, Users, Calendar, Stethoscope, Pill,
  CreditCard, Bell, Settings, LogOut, Menu, X,
  Activity, Building2, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const adminNav = [
  { label: 'Dashboard',    icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Users',        icon: Users,           to: '/admin/users' },
  { label: 'Departments',  icon: Building2,       to: '/admin/departments' },
  { label: 'Appointments', icon: Calendar,        to: '/admin/appointments' },
  { label: 'Billing',      icon: CreditCard,      to: '/admin/billing' },
  { label: 'K8s Monitor',  icon: Activity,        to: '/admin/kubernetes' },
];

const doctorNav = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/doctor/dashboard' },
  { label: 'Appointments',  icon: Calendar,        to: '/doctor/appointments' },
  { label: 'My Patients',   icon: Users,           to: '/doctor/patients' },
  { label: 'Prescriptions', icon: Pill,            to: '/doctor/prescriptions' },
  { label: 'Reports',       icon: Stethoscope,     to: '/doctor/reports' },
];

const patientNav = [
  { label: 'Overview',      icon: LayoutDashboard, to: '/patient/dashboard' },
  { label: 'Appointments',  icon: Calendar,        to: '/patient/appointments' },
  { label: 'Prescriptions', icon: Pill,            to: '/patient/prescriptions' },
  { label: 'Billing',       icon: CreditCard,      to: '/patient/billing' },
  { label: 'Medical Records', icon: Stethoscope,   to: '/patient/records' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = user?.role === 'ADMIN' ? adminNav
    : user?.role === 'DOCTOR' ? doctorNav
    : patientNav;

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">H+</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-semibold text-gray-900">HealthCare+</p>
              <p className="text-xs text-gray-500">Management</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-400 hover:text-gray-600 p-1 rounded"
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-800 text-xs font-semibold">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-1" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center text-gray-400 hover:text-red-500 py-1" title="Logout">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center gap-4 flex-shrink-0">
          <h1 className="text-sm font-semibold text-gray-900 flex-1 capitalize">
            {location.pathname.split('/').filter(Boolean).join(' › ')}
          </h1>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings size={18} />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-800 text-xs font-semibold">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-700 hidden sm:block">{user?.username}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </header> 
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>

  );
}
