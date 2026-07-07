import { Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Topbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-8 py-5 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Good morning, Dr. ARMANI👋</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back to MediCare</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
        >
          {darkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
        </button>

        {/* Notifications */}
        <div className="relative cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-2xl transition-all">
          <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-2xl transition-all">
          <div className="text-right">
            <p className="font-semibold text-gray-900 dark:text-white">Dr. Armani</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cardiologist</p>
          </div>
          <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
            DA
          </div>
        </div>

        {/* Logout */}
        <button className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 px-5 py-3 rounded-2xl transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}