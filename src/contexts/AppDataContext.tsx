import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client, Service, Appointment } from '@/types';
import { MOCK_CLIENTS, MOCK_APPOINTMENTS, SERVICES } from '@/data/mockData';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  soldCount: number;
}

export interface BusinessSettings {
  shopName: string;
  openTime: string;
  closeTime: string;
  appointmentDuration: number;
  notifications: boolean;
  googleCalendarSync: boolean;
  n8nWebhook: string;
}

interface AppDataContextType {
  // Clients
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Services
  services: Service[];
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  // Appointments
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  sellProduct: (id: string, quantity: number) => void;
  
  // Settings
  settings: BusinessSettings;
  updateSettings: (settings: Partial<BusinessSettings>) => void;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Minoxidil', category: 'Tratamento', price: 120, cost: 60, stock: 15, minStock: 5, soldCount: 25 },
  { id: '2', name: 'Gel', category: 'Gel', price: 30, cost: 12, stock: 25, minStock: 8, soldCount: 45 },
  { id: '3', name: 'Shampoo', category: 'Shampoo', price: 30, cost: 12, stock: 20, minStock: 6, soldCount: 38 },
  { id: '4', name: 'Shampoo Anticaspa', category: 'Shampoo', price: 35, cost: 15, stock: 18, minStock: 6, soldCount: 32 },
  { id: '5', name: 'Pasta Modeladora', category: 'Pomada', price: 35, cost: 14, stock: 20, minStock: 5, soldCount: 28 },
  { id: '6', name: 'Pasta Modeladora Premium', category: 'Pomada', price: 45, cost: 20, stock: 15, minStock: 5, soldCount: 22 },
  { id: '7', name: 'Spray', category: 'Spray', price: 45, cost: 18, stock: 12, minStock: 4, soldCount: 18 },
  { id: '8', name: 'Pente de Bolso', category: 'Pente', price: 10, cost: 4, stock: 40, minStock: 10, soldCount: 55 },
  { id: '9', name: 'Shampoo para Barba', category: 'Barba', price: 35, cost: 15, stock: 18, minStock: 5, soldCount: 30 },
];

const INITIAL_SETTINGS: BusinessSettings = {
  shopName: 'BarberPro',
  openTime: '08:00',
  closeTime: '20:00',
  appointmentDuration: 90,
  notifications: true,
  googleCalendarSync: false,
  n8nWebhook: '',
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<BusinessSettings>(INITIAL_SETTINGS);

  // Client operations
  const addClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Service operations
  const addService = (service: Service) => {
    setServices(prev => [...prev, service]);
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Appointment operations
  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  // Product operations
  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const sellProduct = (id: string, quantity: number) => {
    setProducts(prev => prev.map(p => 
      p.id === id 
        ? { ...p, stock: Math.max(0, p.stock - quantity), soldCount: p.soldCount + quantity }
        : p
    ));
  };

  // Settings operations
  const updateSettings = (data: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...data }));
  };

  return (
    <AppDataContext.Provider
      value={{
        clients,
        addClient,
        updateClient,
        deleteClient,
        services,
        addService,
        updateService,
        deleteService,
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        sellProduct,
        settings,
        updateSettings,
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
