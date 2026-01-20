import { Service, Appointment, Client } from '@/types';

export const SERVICES: Service[] = [
  
];

export const MOCK_CLIENTS: Client[] = [
  
];

const today = new Date();
const formatTime = (hours: number, minutes: number = 0) => 
  `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'João Silva',
    clientPhone: '(11) 99999-1111',
    date: today,
    startTime: '09:00',
    endTime: '10:30',
    services: [SERVICES[0], SERVICES[1]],
    status: 'confirmed',
    notes: 'Corte máquina pente 1 e 2',
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Carlos Santos',
    clientPhone: '(11) 99999-2222',
    date: today,
    startTime: '10:30',
    endTime: '12:00',
    services: [SERVICES[3]],
    status: 'scheduled',
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Pedro Oliveira',
    clientPhone: '(11) 99999-3333',
    date: today,
    startTime: '14:00',
    endTime: '15:30',
    services: [SERVICES[4], SERVICES[2]],
    status: 'scheduled',
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Lucas Ferreira',
    clientPhone: '(11) 99999-4444',
    date: today,
    startTime: '15:30',
    endTime: '17:00',
    services: [SERVICES[0], SERVICES[1], SERVICES[2]],
    status: 'confirmed',
    notes: 'Cliente frequente - preferência degradê alto',
  },
  {
    id: '5',
    clientId: '5',
    clientName: 'Marcos Lima',
    clientPhone: '(11) 99999-5555',
    date: today,
    startTime: '17:00',
    endTime: '18:30',
    services: [SERVICES[0]],
    status: 'scheduled',
  },
];

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
