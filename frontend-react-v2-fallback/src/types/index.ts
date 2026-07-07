// ── Auth ──────────────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'NURSE';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ── Patient ───────────────────────────────────────────────────────────────────
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface PatientResponse {
  id: string;
  userId: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies: string;
  chronicConditions: string;
  bloodType: string;
  medicalNotes: string;
  status: PatientStatus;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientStatsResponse {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
}

export interface CreatePatientRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  allergies?: string;
  chronicConditions?: string;
  bloodType?: string;
  medicalNotes?: string;
  insuranceProvider: string;
  insurancePolicyNumber?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  allergies?: string;
  chronicConditions?: string;
  bloodType?: string;
  medicalNotes?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

// ── Doctor ────────────────────────────────────────────────────────────────────
export type DoctorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'SUSPENDED';

export interface DoctorResponse {
  id: string;
  userId: string;
  doctorCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  bio: string;
  qualifications: string;
  yearsOfExperience: number;
  consultationFee: string;
  workStartTime: string;
  workEndTime: string;
  workDays: string;
  maxDailyAppointments: number;
  profileImageUrl: string;
  status: DoctorStatus;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSummaryResponse {
  id: string;
  doctorCode: string;
  fullName: string;
  specialization: string;
  department: string;
  averageRating: number;
  consultationFee: string;
  status: DoctorStatus;
}

export interface DoctorStatsResponse {
  totalDoctors: number;
  activeDoctors: number;
  onLeaveDoctors: number;
  departments: string[];
  specializations: string[];
}

export interface CreateDoctorRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  department: string;
  licenseNumber: string;
  licenseExpiryDate?: string;
  bio?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  consultationFee?: string;
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string;
  maxDailyAppointments?: number;
  profileImageUrl?: string;
}

export interface RatingRequest {
  rating: number;
  comment?: string;
}

// ── Appointment ───────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type AppointmentType =
  | 'CONSULTATION'
  | 'FOLLOW_UP'
  | 'EMERGENCY'
  | 'ROUTINE_CHECKUP'
  | 'PROCEDURE'
  | 'LAB_TEST';

export interface AppointmentResponse {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  notes: string;
  diagnosisSummary: string;
  cancellationReason: string;
  cancelledAt: string;
  confirmedAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStatsResponse {
  totalAppointments: number;
  todayAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  byDepartment: Record<string, number>;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface BookAppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  reason: string;
  notes?: string;
}

export interface CancelAppointmentRequest {
  cancellationReason: string;
}

// ── Prescription ──────────────────────────────────────────────────────────────
export type PrescriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  issueDate: string;
  expiryDate: string;
  status: PrescriptionStatus;
  notes: string;
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionRequest {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  expiryDate?: string;
  notes?: string;
  items: Omit<PrescriptionItem, 'id'>[];
}

// ── Billing ───────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'CANCELLED' | 'OVERDUE';
export type PaymentMethod = 'CASH' | 'CARD' | 'INSURANCE' | 'BANK_TRANSFER' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string;
  paidAt: string;
}

export interface InvoiceResponse {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  lineItems: InvoiceLineItem[];
  payments: PaymentResponse[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingStatsResponse {
  totalInvoices: number;
  totalRevenue: number;
  pendingAmount: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export interface CreateInvoiceRequest {
  patientId: string;
  appointmentId?: string;
  dueDate?: string;
  notes?: string;
  lineItems: Omit<InvoiceLineItem, 'totalPrice'>[];
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
