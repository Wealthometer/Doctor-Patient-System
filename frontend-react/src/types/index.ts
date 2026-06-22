export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  email?: string;
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