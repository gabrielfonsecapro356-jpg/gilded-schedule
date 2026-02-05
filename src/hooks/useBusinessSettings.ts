import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BusinessSettings {
  shopName: string;
  openTime: string;
  closeTime: string;
  appointmentDuration: number;
  notifications: boolean;
  googleCalendarSync: boolean;
  n8nWebhook: string;
}

interface DbBusinessSettings {
  id: string;
  user_id: string;
  shop_name: string;
  open_time: string;
  close_time: string;
  appointment_duration: number;
  notifications_enabled: boolean;
  google_calendar_sync: boolean;
  n8n_webhook: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  shopName: 'BarberPro',
  openTime: '08:00',
  closeTime: '20:00',
  appointmentDuration: 90,
  notifications: true,
  googleCalendarSync: false,
  n8nWebhook: '',
};

export function useBusinessSettings() {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const mapDbToSettings = (dbSettings: DbBusinessSettings): BusinessSettings => ({
    shopName: dbSettings.shop_name,
    openTime: dbSettings.open_time.slice(0, 5),
    closeTime: dbSettings.close_time.slice(0, 5),
    appointmentDuration: dbSettings.appointment_duration,
    notifications: dbSettings.notifications_enabled,
    googleCalendarSync: dbSettings.google_calendar_sync,
    n8nWebhook: dbSettings.n8n_webhook || '',
  });

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(mapDbToSettings(data));
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const updateSettings = async (updates: Partial<BusinessSettings>) => {
    if (!user) return false;

    try {
      const updateData: Record<string, any> = {};
      if (updates.shopName !== undefined) updateData.shop_name = updates.shopName;
      if (updates.openTime !== undefined) updateData.open_time = updates.openTime;
      if (updates.closeTime !== undefined) updateData.close_time = updates.closeTime;
      if (updates.appointmentDuration !== undefined) updateData.appointment_duration = updates.appointmentDuration;
      if (updates.notifications !== undefined) updateData.notifications_enabled = updates.notifications;
      if (updates.googleCalendarSync !== undefined) updateData.google_calendar_sync = updates.googleCalendarSync;
      if (updates.n8nWebhook !== undefined) updateData.n8n_webhook = updates.n8nWebhook || null;

      const { error } = await supabase
        .from('business_settings')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...updates }));
      return true;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Erro ao atualizar configurações',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    settings,
    isLoading,
    updateSettings,
    refetch: fetchSettings,
  };
}
