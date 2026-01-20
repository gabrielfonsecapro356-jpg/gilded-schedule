import { Service, Appointment, Client } from '@/types';

export const SERVICES: Service[] = [
  
];

export const MOCK_CLIENTS: Client[] = [
  
];

const today = new Date();
const formatTime = (hours: number, minutes: number = 0) => 
  `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const getAppointmentsByDate = (date: Date): Appointment[] => {
  return MOCK_APPOINTMENTS.filter(
    (apt) => apt.date.toDateString() === date.toDateString()
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const getMonthlyStats = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
  return months.map((month, index) => ({
    month,
    totalAppointments: Math.floor(Math.random() * 100) + 50,
    revenue: Math.floor(Math.random() * 10000) + 5000,
    serviceBreakdown: SERVICES.slice(0, 4).map((service) => ({
      service: service.name,
      count: Math.floor(Math.random() * 30) + 10,
    })),
  }));
};
