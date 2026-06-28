import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientCreateProfile from './pages/PatientCreateProfile';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Prescriptions from './pages/Prescriptions';
import LoginPage from '@/pages/auth/LoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AppointmentsPage from '@/pages/admin/AppointmentsPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import DepartmentsPage from '@/pages/admin/DepartmentsPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Lazy placeholder for pages not yet built out
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500">This page is connected to the backend API.</p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: '13px', borderRadius: '10px' },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/"         element={<Navigate to="/login" replace />} />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><Placeholder title="Admin" /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AppointmentsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><UserManagementPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><DepartmentsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/billing" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><Placeholder title="Billing Management" /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/kubernetes" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><Placeholder title="Kubernetes Monitor" /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Doctor routes */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <AppLayout><DoctorDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <AppLayout><Patients /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <AppLayout><Appointments /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/doctor/prescriptions" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <AppLayout><Prescriptions /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Patient routes */}
          <Route path="/patient/create-profile" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <AppLayout><PatientCreateProfile /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <AppLayout><PatientDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient/appointments" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <AppLayout><AppointmentsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient/prescriptions" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <AppLayout><Placeholder title="My Prescriptions" /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/patient/billing" element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <AppLayout><Placeholder title="My Billing" /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">403 — Access Denied</h1>
                <p className="text-gray-500 mt-2">You don't have permission to view this page.</p>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
