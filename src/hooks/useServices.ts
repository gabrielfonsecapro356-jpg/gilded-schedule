import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
}

interface DbService {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const mapDbToService = (dbService: DbService): Service => ({
    id: dbService.id,
    name: dbService.name,
    description: dbService.description || undefined,
    duration: dbService.duration,
    price: Number(dbService.price),
    isActive: dbService.is_active,
  });

  const fetchServices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setServices((data || []).map(mapDbToService));
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Erro ao carregar serviços',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const addService = async (service: Omit<Service, 'id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          name: service.name,
          description: service.description || null,
          price: service.price,
          duration: service.duration,
          is_active: service.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      const newService = mapDbToService(data);
      setServices(prev => [...prev, newService]);
      return newService;
    } catch (error: any) {
      console.error('Error adding service:', error);
      toast({
        title: 'Erro ao adicionar serviço',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateService = async (id: string, updates: Partial<Omit<Service, 'id'>>) => {
    try {
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.duration !== undefined) updateData.duration = updates.duration;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ));
      return true;
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: 'Erro ao atualizar serviço',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Erro ao excluir serviço',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    services,
    isLoading,
    addService,
    updateService,
    deleteService,
    refetch: fetchServices,
  };
}
