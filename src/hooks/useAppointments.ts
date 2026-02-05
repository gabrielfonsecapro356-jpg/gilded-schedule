import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Service } from './useServices';

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
  cancelledAt?: Date;
  cancelReason?: string;
  completedAt?: Date;
}

interface DbAppointment {
  id: string;
  user_id: string;
  client_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  cancel_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  clients: {
    id: string;
    name: string;
    phone: string;
  };
}

interface DbAppointmentService {
  service_id: string;
  price_at_time: number;
  services: {
    id: string;
    name: string;
    duration: number;
    price: number;
    is_active: boolean;
  };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!user) return;
    
    try {
      // Fetch appointments with client info
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          clients (
            id,
            name,
            phone
          )
        `)
        .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Fetch appointment services
      const appointmentIds = (appointmentsData || []).map(a => a.id);
      
      let servicesMap: Record<string, Service[]> = {};
      
      if (appointmentIds.length > 0) {
        const { data: appointmentServices, error: servicesError } = await supabase
          .from('appointment_services')
          .select(`
            appointment_id,
            service_id,
            price_at_time,
            services (
              id,
              name,
              duration,
              price,
              is_active
            )
          `)
          .in('appointment_id', appointmentIds);

        if (servicesError) throw servicesError;

        // Group services by appointment
        (appointmentServices || []).forEach((as: any) => {
          if (!servicesMap[as.appointment_id]) {
            servicesMap[as.appointment_id] = [];
          }
          if (as.services) {
            servicesMap[as.appointment_id].push({
              id: as.services.id,
              name: as.services.name,
              duration: as.services.duration,
              price: Number(as.price_at_time),
              isActive: as.services.is_active,
            });
          }
        });
      }

      const mappedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => ({
        id: apt.id,
        clientId: apt.client_id,
        clientName: apt.clients?.name || 'Cliente não encontrado',
        clientPhone: apt.clients?.phone || '',
        date: new Date(apt.date),
        startTime: apt.start_time.slice(0, 5),
        endTime: apt.end_time.slice(0, 5),
        services: servicesMap[apt.id] || [],
        status: apt.status as Appointment['status'],
        notes: apt.notes || undefined,
        cancelledAt: apt.cancelled_at ? new Date(apt.cancelled_at) : undefined,
        cancelReason: apt.cancel_reason || undefined,
        completedAt: apt.completed_at ? new Date(apt.completed_at) : undefined,
      }));

      setAppointments(mappedAppointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro ao carregar agendamentos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'cancelledAt' | 'cancelReason' | 'completedAt'>) => {
    if (!user) return null;

    try {
      // Create appointment
      const { data: aptData, error: aptError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          client_id: appointment.clientId,
          date: appointment.date.toISOString().split('T')[0],
          start_time: appointment.startTime,
          end_time: appointment.endTime,
          status: appointment.status,
          notes: appointment.notes || null,
        })
        .select()
        .single();

      if (aptError) throw aptError;

      // Add services
      if (appointment.services.length > 0) {
        const serviceInserts = appointment.services.map(s => ({
          appointment_id: aptData.id,
          service_id: s.id,
          price_at_time: s.price,
        }));

        const { error: servicesError } = await supabase
          .from('appointment_services')
          .insert(serviceInserts);

        if (servicesError) throw servicesError;
      }

      const newAppointment: Appointment = {
        ...appointment,
        id: aptData.id,
      };

      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (error: any) {
      console.error('Error adding appointment:', error);
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Omit<Appointment, 'id' | 'services'>>) => {
    try {
      const updateData: Record<string, any> = {};
      
      if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
      if (updates.date !== undefined) updateData.date = updates.date.toISOString().split('T')[0];
      if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
      if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.cancelReason !== undefined) updateData.cancel_reason = updates.cancelReason || null;
      if (updates.cancelledAt !== undefined) updateData.cancelled_at = updates.cancelledAt?.toISOString() || null;
      if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString() || null;

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.map(a => 
        a.id === id ? { ...a, ...updates } : a
      ));
      return true;
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Erro ao atualizar agendamento',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Erro ao excluir agendamento',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    appointments,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    refetch: fetchAppointments,
  };
}
