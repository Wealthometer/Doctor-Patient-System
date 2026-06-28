import apiClient from './client';
import type {
  AuthResponse, LoginRequest, RegisterRequest,
  Page, Patient, Doctor, Appointment, Prescription, Invoice,
  AvailableSlot,
} from '@/types';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:        (data: LoginRequest)       => apiClient.post<AuthResponse>('/api/v1/auth/login', data),
  register:     (data: RegisterRequest)    => apiClient.post<AuthResponse>('/api/v1/auth/register', data),
  logout:       ()                         => apiClient.post('/api/v1/auth/logout'),
  me:           ()                         => apiClient.get('/api/v1/auth/me'),
  refreshToken: (refreshToken: string)     => apiClient.post<AuthResponse>('/api/v1/auth/refresh-token', { refreshToken }),
  changePassword:(data: { currentPassword: string; newPassword: string }) =>
    apiClient.put('/api/v1/auth/change-password', data),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientApi = {
  create:         (data: unknown)           => apiClient.post<Patient>('/api/v1/patients', data),
  getById:        (id: string)              => apiClient.get<Patient>(`/api/v1/patients/${id}`),
  getByUserId:    (userId: string)          => apiClient.get<Patient>(`/api/v1/patients/user/${userId}`),
  getByCode:      (code: string)            => apiClient.get<Patient>(`/api/v1/patients/code/${code}`),
  getAll:         (params?: Record<string, unknown>) => apiClient.get<Page<Patient>>('/api/v1/patients', { params }),
  search:         (query: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Patient>>('/api/v1/patients/search', { params: { query, ...params } }),
  getByStatus:    (status: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Patient>>(`/api/v1/patients/status/${status}`, { params }),
  update:         (id: string, data: unknown) => apiClient.put<Patient>(`/api/v1/patients/${id}`, data),
  deactivate:     (id: string)              => apiClient.patch(`/api/v1/patients/${id}/deactivate`),
  getStats:       ()                        => apiClient.get('/api/v1/patients/stats'),
};

// ── Doctors ───────────────────────────────────────────────────────────────────
export const doctorApi = {
  create:              (data: unknown)     => apiClient.post<Doctor>('/api/v1/doctors', data),
  getById:             (id: string)        => apiClient.get<Doctor>(`/api/v1/doctors/${id}`),
  getByUserId:         (userId: string)    => apiClient.get<Doctor>(`/api/v1/doctors/user/${userId}`),
  getAll:              (params?: Record<string, unknown>) => apiClient.get<Page<Doctor>>('/api/v1/doctors', { params }),
  search:              (query: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Doctor>>('/api/v1/doctors/search', { params: { query, ...params } }),
  getByDepartment:     (dept: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Doctor>>(`/api/v1/doctors/department/${dept}`, { params }),
  getActiveByDept:     (dept: string)      => apiClient.get(`/api/v1/doctors/department/${dept}/active`),
  update:              (id: string, data: unknown) => apiClient.put<Doctor>(`/api/v1/doctors/${id}`, data),
  updateStatus:        (id: string, status: string) =>
    apiClient.patch<Doctor>(`/api/v1/doctors/${id}/status`, null, { params: { status } }),
  submitRating:        (id: string, data: { rating: number; comment?: string }) =>
    apiClient.post<Doctor>(`/api/v1/doctors/${id}/ratings`, data),
  getStats:            ()                  => apiClient.get('/api/v1/doctors/stats'),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentApi = {
  book:              (data: unknown)        => apiClient.post<Appointment>('/api/v1/appointments', data),
  getById:           (id: string)           => apiClient.get<Appointment>(`/api/v1/appointments/${id}`),
  getByPatient:      (patientId: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Appointment>>(`/api/v1/appointments/patient/${patientId}`, { params }),
  getByDoctor:       (doctorId: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Appointment>>(`/api/v1/appointments/doctor/${doctorId}`, { params }),
  getDoctorByDate:   (doctorId: string, date: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Appointment>>(`/api/v1/appointments/doctor/${doctorId}/date/${date}`, { params }),
  getAvailableSlots: (doctorId: string, date: string) =>
    apiClient.get<AvailableSlot[]>(`/api/v1/appointments/doctor/${doctorId}/slots`, { params: { date } }),
  confirm:           (id: string)           => apiClient.patch<Appointment>(`/api/v1/appointments/${id}/confirm`),
  start:             (id: string)           => apiClient.patch<Appointment>(`/api/v1/appointments/${id}/start`),
  complete:          (id: string, data: unknown) => apiClient.patch<Appointment>(`/api/v1/appointments/${id}/complete`, data),
  cancel:            (id: string, cancellationReason: string) =>
    apiClient.patch<Appointment>(`/api/v1/appointments/${id}/cancel`, { cancellationReason }),
  getStats:          ()                     => apiClient.get('/api/v1/appointments/stats'),
};

// ── Prescriptions ─────────────────────────────────────────────────────────────
export const prescriptionApi = {
  create:        (data: unknown)            => apiClient.post<Prescription>('/api/v1/prescriptions', data),
  getById:       (id: string)               => apiClient.get<Prescription>(`/api/v1/prescriptions/${id}`),
  getByPatient:  (patientId: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Prescription>>(`/api/v1/prescriptions/patient/${patientId}`, { params }),
  getActive:     (patientId: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Prescription>>(`/api/v1/prescriptions/patient/${patientId}/active`, { params }),
  getByDoctor:   (doctorId: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Prescription>>(`/api/v1/prescriptions/doctor/${doctorId}`, { params }),
  cancel:        (id: string)               => apiClient.patch<Prescription>(`/api/v1/prescriptions/${id}/cancel`),
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingApi = {
  createInvoice:     (data: unknown)        => apiClient.post<Invoice>('/api/v1/billing/invoices', data),
  getInvoiceById:    (id: string)           => apiClient.get<Invoice>(`/api/v1/billing/invoices/${id}`),
  getAllInvoices:     (params?: Record<string, unknown>) =>
    apiClient.get<Page<Invoice>>('/api/v1/billing/invoices', { params }),
  getPatientInvoices:(patientId: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Invoice>>(`/api/v1/billing/invoices/patient/${patientId}`, { params }),
  getByStatus:       (status: string, params?: Record<string, unknown>) =>
    apiClient.get<Page<Invoice>>(`/api/v1/billing/invoices/status/${status}`, { params }),
  recordPayment:     (id: string, data: unknown) =>
    apiClient.post<Invoice>(`/api/v1/billing/invoices/${id}/payments`, data),
  cancelInvoice:     (id: string)           => apiClient.patch<Invoice>(`/api/v1/billing/invoices/${id}/cancel`),
  getStats:          ()                     => apiClient.get('/api/v1/billing/stats'),
};
