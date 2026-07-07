import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Patient pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientPrescriptions from './pages/patient/Prescriptions';
import PatientBilling from './pages/patient/Billing';
import FindDoctors from './pages/patient/FindDoctors';
import PatientProfile from './pages/patient/Profile';

// Doctor pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import DoctorProfile from './pages/doctor/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminPatients from './pages/admin/Patients';
import AdminDoctors from './pages/admin/Doctors';
import AdminAppointments from './pages/admin/Appointments';
import AdminBilling from './pages/admin/Billing';
import AdminUsers from './pages/admin/Users';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'PATIENT') return <Navigate to="/patient" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/doctor" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Patient */}
      <Route element={<ProtectedRoute roles={['PATIENT']}><Layout /></ProtectedRoute>}>
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
        <Route path="/patient/billing" element={<PatientBilling />} />
        <Route path="/patient/doctors" element={<FindDoctors />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Route>

      {/* Doctor */}
      <Route element={<ProtectedRoute roles={['DOCTOR', 'NURSE']}><Layout /></ProtectedRoute>}>
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute roles={['ADMIN']}><Layout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/billing" element={<AdminBilling />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '10px',
              background: '#1A2733',
              color: '#fff',
              fontSize: '13.5px',
            },
            success: { iconTheme: { primary: '#17C3A3', secondary: '#fff' } },
            error: { iconTheme: { primary: '#D94040', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
