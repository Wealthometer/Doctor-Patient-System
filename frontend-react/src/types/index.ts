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
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
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
}

export interface Prescription {
  id: string;
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