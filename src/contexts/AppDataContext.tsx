import React, { createContext, useContext, ReactNode } from 'react';
import { useClients, Client } from '@/hooks/useClients';
import { useServices, Service } from '@/hooks/useServices';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import { useProducts, Product } from '@/hooks/useProducts';
import { useBusinessSettings, BusinessSettings } from '@/hooks/useBusinessSettings';

interface AppDataContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client | null>;
  updateClient: (id: string, client: Partial<Omit<Client, 'id' | 'createdAt'>>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
  
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => Promise<Service | null>;
  updateService: (id: string, service: Partial<Omit<Service, 'id'>>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'cancelledAt' | 'cancelReason' | 'completedAt'>) => Promise<Appointment | null>;
  updateAppointment: (id: string, appointment: Partial<Omit<Appointment, 'id' | 'services'>>) => Promise<boolean>;
  editAppointment: (id: string, updates: Partial<Omit<Appointment, 'id'>>, newServices?: Service[]) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id'>>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  sellProduct: (id: string, quantity: number) => Promise<boolean>;
  
  settings: BusinessSettings;
  updateSettings: (settings: Partial<BusinessSettings>) => Promise<boolean>;

  isLoading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const clientsHook = useClients();
  const servicesHook = useServices();
  const appointmentsHook = useAppointments();
  const productsHook = useProducts();
  const settingsHook = useBusinessSettings();

  const isLoading = 
    clientsHook.isLoading || 
    servicesHook.isLoading || 
    appointmentsHook.isLoading || 
    productsHook.isLoading ||
    settingsHook.isLoading;

  return (
    <AppDataContext.Provider
      value={{
        clients: clientsHook.clients,
        addClient: clientsHook.addClient,
        updateClient: clientsHook.updateClient,
        deleteClient: clientsHook.deleteClient,
        
        services: servicesHook.services,
        addService: servicesHook.addService,
        updateService: servicesHook.updateService,
        deleteService: servicesHook.deleteService,
        
        appointments: appointmentsHook.appointments,
        addAppointment: appointmentsHook.addAppointment,
        updateAppointment: appointmentsHook.updateAppointment,
        editAppointment: appointmentsHook.editAppointment,
        deleteAppointment: appointmentsHook.deleteAppointment,
        
        products: productsHook.products,
        addProduct: productsHook.addProduct,
        updateProduct: productsHook.updateProduct,
        deleteProduct: productsHook.deleteProduct,
        sellProduct: productsHook.sellProduct,
        
        settings: settingsHook.settings,
        updateSettings: settingsHook.updateSettings,

        isLoading,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

export type { Client } from '@/hooks/useClients';
export type { Service } from '@/hooks/useServices';
export type { Appointment } from '@/hooks/useAppointments';
export type { Product } from '@/hooks/useProducts';
export type { BusinessSettings } from '@/hooks/useBusinessSettings';
