import { api } from './client';
import type {
  AuthResponse, LoginRequest, RegisterRequest, ChangePasswordRequest, UserInfo,
  PatientResponse, PatientStatsResponse, CreatePatientRequest, UpdatePatientRequest, Page,
  DoctorResponse, DoctorSummaryResponse, DoctorStatsResponse, CreateDoctorRequest, RatingRequest, DoctorStatus,
  AppointmentResponse, AppointmentStatsResponse, AvailableSlot, BookAppointmentRequest,
  CancelAppointmentRequest, UpdateAppointmentRequest,
  Prescription, CreatePrescriptionRequest,
  InvoiceResponse, BillingStatsResponse, CreateInvoiceRequest, RecordPaymentRequest, InvoiceStatus,
} from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/api/v1/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/api/v1/auth/register', data).then(r => r.data),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>('/api/v1/auth/refresh-token', { refreshToken }).then(r => r.data),

  logout: () =>
    api.post('/api/v1/auth/logout').then(r => r.data),

  me: () =>
    api.get<UserInfo>('/api/v1/auth/me').then(r => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    api.put('/api/v1/auth/change-password', data).then(r => r.data),
};

// ── Patients ──────────────────────────────────────────────────────────────────
export const patientApi = {
  create: (data: CreatePatientRequest) =>
    api.post<PatientResponse>('/api/v1/patients', data).then(r => r.data),

  getById: (id: string) =>
    api.get<PatientResponse>(`/api/v1/patients/${id}`).then(r => r.data),

  getByUserId: (userId: string) =>
    api.get<PatientResponse>(`/api/v1/patients/user/${userId}`).then(r => r.data),

  getByCode: (code: string) =>
    api.get<PatientResponse>(`/api/v1/patients/code/${code}`).then(r => r.data),

  getAll: (page = 0, size = 20) =>
    api.get<Page<PatientResponse>>('/api/v1/patients', { params: { page, size, sort: 'createdAt,desc' } }).then(r => r.data),

  search: (query: string, page = 0, size = 20) =>
    api.get<Page<PatientResponse>>('/api/v1/patients/search', { params: { query, page, size } }).then(r => r.data),

  getByStatus: (status: string, page = 0, size = 20) =>
    api.get<Page<PatientResponse>>(`/api/v1/patients/status/${status}`, { params: { page, size } }).then(r => r.data),

  update: (id: string, data: UpdatePatientRequest) =>
    api.put<PatientResponse>(`/api/v1/patients/${id}`, data).then(r => r.data),

  deactivate: (id: string) =>
    api.patch(`/api/v1/patients/${id}/deactivate`).then(r => r.data),

  getStats: () =>
    api.get<PatientStatsResponse>('/api/v1/patients/stats').then(r => r.data),
};

// ── Doctors ───────────────────────────────────────────────────────────────────
export const doctorApi = {
  create: (data: CreateDoctorRequest) =>
    api.post<DoctorResponse>('/api/v1/doctors', data).then(r => r.data),

  getById: (id: string) =>
    api.get<DoctorResponse>(`/api/v1/doctors/${id}`).then(r => r.data),

  getByUserId: (userId: string) =>
    api.get<DoctorResponse>(`/api/v1/doctors/user/${userId}`).then(r => r.data),

  getByCode: (code: string) =>
    api.get<DoctorResponse>(`/api/v1/doctors/code/${code}`).then(r => r.data),

  getAll: (page = 0, size = 20) =>
    api.get<Page<DoctorResponse>>('/api/v1/doctors', { params: { page, size, sort: 'lastName' } }).then(r => r.data),

  search: (query: string, page = 0, size = 20) =>
    api.get<Page<DoctorResponse>>('/api/v1/doctors/search', { params: { query, page, size } }).then(r => r.data),

  getByDepartment: (department: string, page = 0, size = 20) =>
    api.get<Page<DoctorResponse>>(`/api/v1/doctors/department/${department}`, { params: { page, size } }).then(r => r.data),

  getActiveDoctorsByDepartment: (department: string) =>
    api.get<DoctorSummaryResponse[]>(`/api/v1/doctors/department/${department}/active`).then(r => r.data),

  getBySpecialization: (specialization: string, page = 0, size = 20) =>
    api.get<Page<DoctorResponse>>(`/api/v1/doctors/specialization/${specialization}`, { params: { page, size } }).then(r => r.data),

  update: (id: string, data: Partial<CreateDoctorRequest>) =>
    api.put<DoctorResponse>(`/api/v1/doctors/${id}`, data).then(r => r.data),

  updateStatus: (id: string, status: DoctorStatus) =>
    api.patch<DoctorResponse>(`/api/v1/doctors/${id}/status`, null, { params: { status } }).then(r => r.data),

  submitRating: (id: string, data: RatingRequest) =>
    api.post<DoctorResponse>(`/api/v1/doctors/${id}/ratings`, data).then(r => r.data),

  getStats: () =>
    api.get<DoctorStatsResponse>('/api/v1/doctors/stats').then(r => r.data),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentApi = {
  book: (data: BookAppointmentRequest) =>
    api.post<AppointmentResponse>('/api/v1/appointments', data).then(r => r.data),

  getById: (id: string) =>
    api.get<AppointmentResponse>(`/api/v1/appointments/${id}`).then(r => r.data),

  getByPatient: (patientId: string, page = 0, size = 20) =>
    api.get<Page<AppointmentResponse>>(`/api/v1/appointments/patient/${patientId}`, { params: { page, size } }).then(r => r.data),

  getByDoctor: (doctorId: string, page = 0, size = 20) =>
    api.get<Page<AppointmentResponse>>(`/api/v1/appointments/doctor/${doctorId}`, { params: { page, size } }).then(r => r.data),

  getDoctorByDate: (doctorId: string, date: string, page = 0) =>
    api.get<Page<AppointmentResponse>>(`/api/v1/appointments/doctor/${doctorId}/date/${date}`, { params: { page, size: 50 } }).then(r => r.data),

  getAvailableSlots: (doctorId: string, date: string) =>
    api.get<AvailableSlot[]>(`/api/v1/appointments/doctor/${doctorId}/slots`, { params: { date } }).then(r => r.data),

  confirm: (id: string) =>
    api.patch<AppointmentResponse>(`/api/v1/appointments/${id}/confirm`).then(r => r.data),

  start: (id: string) =>
    api.patch<AppointmentResponse>(`/api/v1/appointments/${id}/start`).then(r => r.data),

  complete: (id: string, data: Partial<UpdateAppointmentRequest>) =>
    api.patch<AppointmentResponse>(`/api/v1/appointments/${id}/complete`, data).then(r => r.data),

  cancel: (id: string, data: CancelAppointmentRequest) =>
    api.patch<AppointmentResponse>(`/api/v1/appointments/${id}/cancel`, data).then(r => r.data),

  getStats: () =>
    api.get<AppointmentStatsResponse>('/api/v1/appointments/stats').then(r => r.data),
};

// ── Prescriptions ─────────────────────────────────────────────────────────────
export const prescriptionApi = {
  create: (data: CreatePrescriptionRequest) =>
    api.post<Prescription>('/api/v1/prescriptions', data).then(r => r.data),

  getById: (id: string) =>
    api.get<Prescription>(`/api/v1/prescriptions/${id}`).then(r => r.data),

  getByPatient: (patientId: string, page = 0, size = 20) =>
    api.get<Page<Prescription>>(`/api/v1/prescriptions/patient/${patientId}`, { params: { page, size } }).then(r => r.data),

  getActiveByPatient: (patientId: string, page = 0, size = 20) =>
    api.get<Page<Prescription>>(`/api/v1/prescriptions/patient/${patientId}/active`, { params: { page, size } }).then(r => r.data),

  getByDoctor: (doctorId: string, page = 0, size = 20) =>
    api.get<Page<Prescription>>(`/api/v1/prescriptions/doctor/${doctorId}`, { params: { page, size } }).then(r => r.data),

  cancel: (id: string) =>
    api.patch<Prescription>(`/api/v1/prescriptions/${id}/cancel`).then(r => r.data),
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingApi = {
  createInvoice: (data: CreateInvoiceRequest) =>
    api.post<InvoiceResponse>('/api/v1/billing/invoices', data).then(r => r.data),

  getInvoiceById: (id: string) =>
    api.get<InvoiceResponse>(`/api/v1/billing/invoices/${id}`).then(r => r.data),

  getAllInvoices: (page = 0, size = 20) =>
    api.get<Page<InvoiceResponse>>('/api/v1/billing/invoices', { params: { page, size } }).then(r => r.data),

  getPatientInvoices: (patientId: string, page = 0, size = 20) =>
    api.get<Page<InvoiceResponse>>(`/api/v1/billing/invoices/patient/${patientId}`, { params: { page, size } }).then(r => r.data),

  getByStatus: (status: InvoiceStatus, page = 0, size = 20) =>
    api.get<Page<InvoiceResponse>>(`/api/v1/billing/invoices/status/${status}`, { params: { page, size } }).then(r => r.data),

  recordPayment: (id: string, data: RecordPaymentRequest) =>
    api.post<InvoiceResponse>(`/api/v1/billing/invoices/${id}/payments`, data).then(r => r.data),

  cancelInvoice: (id: string) =>
    api.patch<InvoiceResponse>(`/api/v1/billing/invoices/${id}/cancel`).then(r => r.data),

  getStats: () =>
    api.get<BillingStatsResponse>('/api/v1/billing/stats').then(r => r.data),
};
