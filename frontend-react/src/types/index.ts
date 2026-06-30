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
  createdAt: string;
  updatedAt: string;
}

export interface DoctorSummaryResponse {
  id: string;
  doctorCode: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
  averageRating?: number;
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
}

export interface DoctorStatsResponse {
  total: number;
  active: number;
  byDepartment: Record<string, number>;
  bySpecialization: Record<string, number>;
}

// ── Appointment ──────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED'
  | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';

export type AppointmentType =
  | 'CONSULTATION' | 'FOLLOW_UP' | 'ROUTINE_CHECKUP' | 'EMERGENCY'
  | 'TELEMEDICINE' | 'PROCEDURE' | 'LAB_REVIEW';

export interface AppointmentResponse {
  id: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  diagnosisSummary?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookAppointmentRequest {
  patientId: string;
  doctorId: string;
export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

// ── Prescription ─────────────────────────────────────────────────────────────
export type PrescriptionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  appointmentId?: string;
  medications: Medication[];
  diagnosis: string;
  notes?: string;
  issueDate: string;
  expiryDate?: string;
  status: PrescriptionStatus;
  createdAt: string;
}

export interface CreatePrescriptionRequest {
  patientId: string;
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
