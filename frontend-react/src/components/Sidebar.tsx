import { Calendar, Users, Clock, FileText, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { icon: Calendar, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'My Patients', path: '/patients' },
  { icon: Clock, label: 'Appointments', path: '/appointments' },
  { icon: FileText, label: 'Prescriptions', path: '/prescriptions' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-600 rounded-3xl flex items-center justify-center text-white text-3xl">🏥</div>
          <div>
            <h1 className="text-3xl font-bold">MediCare</h1>
            <p className="text-sm text-gray-500">Healthcare OS</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="text-xs font-semibold text-gray-500 px-4 mb-3">MAIN MENU</div>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${
                location.pathname === item.path 
                  ? 'bg-teal-50 text-teal-700' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t">
        <button className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );
}