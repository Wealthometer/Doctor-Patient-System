export interface User {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  email: string;
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