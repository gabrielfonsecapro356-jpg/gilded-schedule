export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: Date;
  startTime: string;
  endTime: string;
  services: Service[];
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  googleEventId?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  completedAt?: Date;
}

export interface DailyStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  revenue: number;
}

export interface MonthlyStats {
  month: string;
  totalAppointments: number;
  serviceBreakdown: { service: string; count: number }[];
  revenue: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'barber';
}
