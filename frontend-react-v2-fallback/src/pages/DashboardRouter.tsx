import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { AdminDashboard } from '../admin/AdminDashboard';
import { DoctorDashboard } from '../doctor/DoctorDashboard';
import { PatientDashboard } from '../patient/PatientDashboard';

// Nurse and default fall back to a simplified admin-like view
export const DashboardRouter: React.FC = () => {
  const user = useAppSelector(s => s.auth.user);

  switch (user?.role) {
    case 'ADMIN':   return <AdminDashboard />;
    case 'DOCTOR':  return <DoctorDashboard />;
    case 'PATIENT': return <PatientDashboard />;
    case 'NURSE':   return <AdminDashboard />; // nurses see same overview
    default:        return <AdminDashboard />;
  }
};
