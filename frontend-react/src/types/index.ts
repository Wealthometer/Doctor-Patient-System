<<<<<<< HEAD
// ── Auth ──────────────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'NURSE';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
=======
export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  email?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
>>>>>>> a6232077d0e0ab37b4384586393aa4203b9a7e63
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
<<<<<<< HEAD
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

// ── Patient ───────────────────────────────────────────────────────────────────
export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'DECEASED' | 'TRANSFERRED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface Patient {
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
  address?: string;
  city?: string;
  state?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  status: PatientStatus;
  insuranceProvider: string;
  createdAt: string;
}

// ── Doctor ────────────────────────────────────────────────────────────────────
export type DoctorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'SUSPENDED';

export interface Doctor {
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
  bio?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  consultationFee?: string;
  workStartTime?: string;
  workEndTime?: string;
  workDays?: string;
  maxDailyAppointments?: number;
  profileImageUrl?: string;
  status: DoctorStatus;
  averageRating: number;
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
=======
  firstName?: string;
  lastName?: string;
  role?: Role;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Patient {
  id: string;
  name: string;
  age?: number;
  email?: string;
  phone?: string;
  condition?: string;
  lastVisit?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty?: string;
  email?: string;
  phone?: string;
  department?: string;
  status?: string;
  rating?: number;
>>>>>>> a6232077d0e0ab37b4384586393aa4203b9a7e63
}

export interface Prescription {
  id: string;
<<<<<<< HEAD
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
=======
  patientName: string;
  doctorName: string;
  medication: string;
  dosage: string;
  instructions?: string;
  dateIssued: string;
  status?: string;
}

export interface Invoice {
  id: string;
  patientName: string;
  amount: number;
  status: string;
  dueDate: string;
}

export interface AvailableSlot {
  doctorId: string;
  date: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface Stats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
}
>>>>>>> a6232077d0e0ab37b4384586393aa4203b9a7e63
