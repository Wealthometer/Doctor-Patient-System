// ── Auth ────────────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'NURSE';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
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

// ── Patient ─────────────────────────────────────────────────────────────────
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface PatientResponse {
  id: string;
  userId: string;
  patientCode: string;
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
  country: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  allergies?: string;
  chronicConditions?: string;
  bloodType?: string;
  medicalNotes?: string;
  insuranceProvider: string;
  insurancePolicyNumber?: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
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

export interface PatientStatsResponse {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

// ── Doctor ──────────────────────────────────────────────────────────────────
export type DoctorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';

export interface DoctorResponse {
  id: string;
  userId: string;
  doctorCode: string;
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
  averageRating?: number;
  totalRatings?: number;
  status: DoctorStatus;
  totalRatings: number;
  createdAt: string;
}

// ── Appointment ───────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS'
  | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';

export type AppointmentType =
  | 'CONSULTATION' | 'FOLLOW_UP' | 'ROUTINE_CHECKUP'
  | 'EMERGENCY' | 'TELEMEDICINE' | 'PROCEDURE' | 'LAB_REVIEW';

export interface Appointment {
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
  notes?: string;
  diagnosisSummary?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// ── Prescription ──────────────────────────────────────────────────────────────
export type PrescriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
  refillsAllowed: number;
  refillsUsed: number;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  issueDate: string;
  expiryDate: string;
  diagnosis?: string;
  notes?: string;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  createdAt: string;
}

// ── Billing ───────────────────────────────────────────────────────────────────
export type InvoiceStatus =
  | 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  department: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  insuranceProvider: string;
  insuranceCoverage: number;
  status: InvoiceStatus;
  lineItems: LineItem[];
  payments: Payment[];
}

export interface LineItem {
  id: string;
  description: string;
  serviceCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  paymentReference: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
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

export interface ApiError {
  title: string;
  detail: string;
  status: number;
  timestamp: string;
}
