import { useState, useMemo } from 'react';
import { Plus, Search, Filter, UserPlus, Calendar as CalendarIcon } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAppData } from '@/contexts/AppDataContext';
import { Appointment } from '@/types';
import { ClientFormDialog } from '@/components/ClientFormDialog';
import { DatePickerField } from '@/components/DatePickerField';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function Appointments() {
  const { clients, services, appointments, addAppointment, updateAppointment } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Period filter state
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);

  // New appointment form state
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleStatusChange = (id: string, status: Appointment['status'], reason?: string) => {
    const updateData: Partial<Appointment> = { status };
    
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      if (reason) {
        updateData.cancelReason = reason;
      }
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'scheduled') {
      updateData.cancelledAt = undefined;
      updateData.cancelReason = undefined;
      updateData.completedAt = undefined;
    }
    
    updateAppointment(id, updateData);
    toast({
      title: 'Status atualizado',
      description: `Agendamento marcado como ${status === 'completed' ? 'concluído' : status === 'cancelled' ? 'cancelado' : 'agendado'}.`,
    });
  };

  const handleCreateAppointment = () => {
    if (!selectedClient || !selectedDate || !selectedTime || selectedServices.length === 0) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    const selectedServicesList = services.filter(s => selectedServices.includes(s.id));
    const totalDuration = selectedServicesList.reduce((sum, s) => sum + s.duration, 0);
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const endHours = hours + Math.floor((minutes + totalDuration) / 60);
    const endMinutes = (minutes + totalDuration) % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      clientId: selectedClient,
      clientName: client?.name || '',
      clientPhone: client?.phone || '',
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      services: selectedServicesList,
      status: 'scheduled',
      notes: notes || undefined,
    };

    addAppointment(newAppointment);
    setIsDialogOpen(false);
    resetForm();
    
    toast({
      title: 'Agendamento criado',
      description: `Agendamento para ${client?.name} criado com sucesso.`,
    });
  };

  const resetForm = () => {
    setSelectedClient('');
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedServices([]);
    setNotes('');
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Calculate monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    });
  }, [appointments, currentMonth, currentYear]);

  const monthlyStats = useMemo(() => {
    const total = monthlyAppointments.length;
    const scheduled = monthlyAppointments.filter(a => a.status === 'scheduled').length;
    const completed = monthlyAppointments.filter(a => a.status === 'completed').length;
    const cancelled = monthlyAppointments.filter(a => a.status === 'cancelled').length;
    const revenue = monthlyAppointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.services.reduce((s, svc) => s + svc.price, 0), 0);
    return { total, scheduled, completed, cancelled, revenue };
  }, [monthlyAppointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = apt.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      
      // Period filter
      let matchesPeriod = true;
      if (startDateFilter) {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        const startDate = new Date(startDateFilter);
        startDate.setHours(0, 0, 0, 0);
        matchesPeriod = aptDate >= startDate;
      }
      if (matchesPeriod && endDateFilter) {
        const aptDate = new Date(apt.date);
        aptDate.setHours(23, 59, 59, 999);
        const endDate = new Date(endDateFilter);
        endDate.setHours(23, 59, 59, 999);
        matchesPeriod = aptDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesPeriod;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, searchTerm, statusFilter, startDateFilter, endDateFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  }).filter(time => {
    const [h] = time.split(':').map(Number);
    return h >= 8 && h < 20;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Agendamentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os agendamentos da barbearia
            </p>
          </div>
          <div className="flex gap-2">
            <ClientFormDialog 
              trigger={
                <Button variant="outline" size="lg">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Novo Cliente
                </Button>
              }
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gold" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl">
                    Novo Agendamento
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Client Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente</label>
                    <Select value={selectedClient} onValueChange={setSelectedClient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} - {client.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {clients.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Nenhum cliente cadastrado. Cadastre um cliente primeiro.
                      </p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data</label>
                      <DatePickerField
                        date={selectedDate}
                        onDateChange={setSelectedDate}
                        placeholder="Selecione a data"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Horário</label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map(time => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serviços</label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                      {services.map(service => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => toggleService(service.id)}
                        >
                          <Checkbox
                            checked={selectedServices.includes(service.id)}
                            onCheckedChange={() => toggleService(service.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground">
                              R$ {service.price} • {service.duration}min
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observações</label>
                    <Input
                      placeholder="Ex: Corte máquina pente 1 e 2"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button variant="gold" className="w-full" onClick={handleCreateAppointment}>
                    Criar Agendamento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Monthly Stats */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Resumo do Mês ({new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-xl font-heading font-bold text-gradient-gold">{monthlyStats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-blue-400">{monthlyStats.scheduled}</p>
              <p className="text-xs text-muted-foreground">Agendados</p>
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-green-500">{monthlyStats.completed}</p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-red-400">{monthlyStats.cancelled}</p>
              <p className="text-xs text-muted-foreground">Cancelados</p>
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-foreground">R$ {monthlyStats.revenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Faturamento</p>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendados</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Period Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Período</label>
                <div className="flex gap-2 items-center">
                  <DatePickerField
                    date={startDateFilter}
                    onDateChange={setStartDateFilter}
                    placeholder="Data inicial"
                  />
                  <span className="text-muted-foreground">até</span>
                  <DatePickerField
                    date={endDateFilter}
                    onDateChange={setEndDateFilter}
                    placeholder="Data final"
                  />
                </div>
              </div>
              {(searchTerm || statusFilter !== 'all' || startDateFilter || endDateFilter) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={handleStatusChange}
                showCancelledSlot
              />
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                Nenhum agendamento encontrado
              </p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}