import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: Date;
}

interface DbClient {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const mapDbToClient = (dbClient: DbClient): Client => ({
    id: dbClient.id,
    name: dbClient.name,
    phone: dbClient.phone,
    email: dbClient.email || undefined,
    notes: dbClient.notes || undefined,
    createdAt: new Date(dbClient.created_at),
  });

  const fetchClients = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setClients((data || []).map(mapDbToClient));
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Erro ao carregar clientes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: client.name,
          phone: client.phone,
          email: client.email || null,
          notes: client.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newClient = mapDbToClient(data);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast({
        title: 'Erro ao adicionar cliente',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: updates.name,
          phone: updates.phone,
          email: updates.email || null,
          notes: updates.notes || null,
        })
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.map(c => 
        c.id === id ? { ...c, ...updates } : c
      ));
      return true;
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: 'Erro ao atualizar cliente',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    clients,
    isLoading,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  };
}
