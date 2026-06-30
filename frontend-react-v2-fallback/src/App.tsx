import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardRouter } from './pages/DashboardRouter';
import { PatientsPage } from './pages/admin/PatientsPage';
import { DoctorsPage } from './pages/admin/DoctorsPage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { PrescriptionsPage } from './pages/prescriptions/PrescriptionsPage';
import { BillingPage } from './pages/billing/BillingPage';
import { ProfilePage } from './pages/profile/ProfilePage';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
