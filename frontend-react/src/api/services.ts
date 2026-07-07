import { api } from './client';
import type {
  AuthResponse, LoginRequest, RegisterRequest, UserInfo,
  PatientResponse, CreatePatientRequest, UpdatePatientRequest, PatientStatsResponse, Page,
  DoctorResponse, CreateDoctorRequest, DoctorStatsResponse, DoctorStatus, DoctorSummaryResponse,
  AppointmentResponse, BookAppointmentRequest, AppointmentStatsResponse, AvailableSlot,
  Prescription, CreatePrescriptionRequest,
  InvoiceResponse, BillingStatsResponse,
} from '../types';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),
  me: () => api.get<UserInfo>('/auth/me').then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data).then(r => r.data),
};

// ── Patient ──────────────────────────────────────────────────────────────────
export const patientApi = {
  create: (data: CreatePatientRequest) =>
    api.post<PatientResponse>('/patients', data).then(r => r.data),
  getById: (id: string) =>
    api.get<PatientResponse>(`/patients/${id}`).then(r => r.data),
  getByUserId: (userId: string) =>
    api.get<PatientResponse>(`/patients/user/${userId}`).then(r => r.data),
  getAll: (page = 0, size = 20) =>
    api.get<Page<PatientResponse>>('/patients', { params: { page, size } }).then(r => r.data),
  search: (query: string, page = 0) =>
    api.get<Page<PatientResponse>>('/patients/search', { params: { query, page } }).then(r => r.data),
  update: (id: string, data: UpdatePatientRequest) =>
    api.put<PatientResponse>(`/patients/${id}`, data).then(r => r.data),
  deactivate: (id: string) =>
    api.patch(`/patients/${id}/deactivate`).then(r => r.data),
  stats: () =>
    api.get<PatientStatsResponse>('/patients/stats').then(r => r.data),
};

// ── Doctor ───────────────────────────────────────────────────────────────────
export const doctorApi = {
  create: (data: CreateDoctorRequest) =>
    api.post<DoctorResponse>('/doctors', data).then(r => r.data),
  getById: (id: string) =>
    api.get<DoctorResponse>(`/doctors/${id}`).then(r => r.data),
  getByUserId: (userId: string) =>
    api.get<DoctorResponse>(`/doctors/user/${userId}`).then(r => r.data),
  getAll: (page = 0, size = 20) =>
    api.get<Page<DoctorResponse>>('/doctors', { params: { page, size } }).then(r => r.data),
  search: (query: string, page = 0) =>
    api.get<Page<DoctorResponse>>('/doctors/search', { params: { query, page } }).then(r => r.data),
  getByDepartment: (department: string) =>
    api.get<DoctorSummaryResponse[]>(`/doctors/department/${department}/active`).then(r => r.data),
  update: (id: string, data: Partial<CreateDoctorRequest>) =>
    api.put<DoctorResponse>(`/doctors/${id}`, data).then(r => r.data),
  updateStatus: (id: string, status: DoctorStatus) =>
    api.patch<DoctorResponse>(`/doctors/${id}/status`, null, { params: { status } }).then(r => r.data),
  submitRating: (id: string, data: { rating: number; comment?: string }) =>
    api.post<DoctorResponse>(`/doctors/${id}/ratings`, data).then(r => r.data),
  stats: () =>
    api.get<DoctorStatsResponse>('/doctors/stats').then(r => r.data),
};

// ── Appointment ───────────────────────────────────────────────────────────────
export const appointmentApi = {
  book: (data: BookAppointmentRequest) =>
    api.post<AppointmentResponse>('/appointments', data).then(r => r.data),
  getById: (id: string) =>
    api.get<AppointmentResponse>(`/appointments/${id}`).then(r => r.data),
  getByPatient: (patientId: string, page = 0) =>
    api.get<Page<AppointmentResponse>>(`/appointments/patient/${patientId}`, { params: { page } }).then(r => r.data),
  getByDoctor: (doctorId: string, page = 0) =>
    api.get<Page<AppointmentResponse>>(`/appointments/doctor/${doctorId}`, { params: { page } }).then(r => r.data),
  getDoctorSlots: (doctorId: string, date: string) =>
    api.get<AvailableSlot[]>(`/appointments/doctor/${doctorId}/slots`, { params: { date } }).then(r => r.data),
  confirm: (id: string) =>
    api.patch<AppointmentResponse>(`/appointments/${id}/confirm`).then(r => r.data),
  start: (id: string) =>
    api.patch<AppointmentResponse>(`/appointments/${id}/start`).then(r => r.data),
  complete: (id: string, data: { diagnosisSummary?: string; notes?: string }) =>
    api.patch<AppointmentResponse>(`/appointments/${id}/complete`, data).then(r => r.data),
  cancel: (id: string, cancellationReason: string) =>
    api.patch<AppointmentResponse>(`/appointments/${id}/cancel`, { cancellationReason }).then(r => r.data),
  stats: () =>
    api.get<AppointmentStatsResponse>('/appointments/stats').then(r => r.data),
};

// ── Prescription ──────────────────────────────────────────────────────────────
export const prescriptionApi = {
  create: (data: CreatePrescriptionRequest) =>
    api.post<Prescription>('/prescriptions', data).then(r => r.data),
  getById: (id: string) =>
    api.get<Prescription>(`/prescriptions/${id}`).then(r => r.data),
  getByPatient: (patientId: string, page = 0) =>
    api.get<Page<Prescription>>(`/prescriptions/patient/${patientId}`, { params: { page } }).then(r => r.data),
  getActiveByPatient: (patientId: string) =>
    api.get<Page<Prescription>>(`/prescriptions/patient/${patientId}/active`).then(r => r.data),
  getByDoctor: (doctorId: string, page = 0) =>
    api.get<Page<Prescription>>(`/prescriptions/doctor/${doctorId}`, { params: { page } }).then(r => r.data),
  cancel: (id: string) =>
    api.patch<Prescription>(`/prescriptions/${id}/cancel`).then(r => r.data),
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingApi = {
  getPatientInvoices: (patientId: string, page = 0) =>
    api.get<Page<InvoiceResponse>>(`/billing/invoices/patient/${patientId}`, { params: { page } }).then(r => r.data),
  getAll: (page = 0) =>
    api.get<Page<InvoiceResponse>>('/billing/invoices', { params: { page } }).then(r => r.data),
  getById: (id: string) =>
    api.get<InvoiceResponse>(`/billing/invoices/${id}`).then(r => r.data),
  recordPayment: (id: string, data: { amount: number; paymentMethod: string; notes?: string }) =>
    api.post<InvoiceResponse>(`/billing/invoices/${id}/payments`, data).then(r => r.data),
  cancel: (id: string) =>
    api.patch<InvoiceResponse>(`/billing/invoices/${id}/cancel`).then(r => r.data),
  stats: () =>
    api.get<BillingStatsResponse>('/billing/stats').then(r => r.data),
};
