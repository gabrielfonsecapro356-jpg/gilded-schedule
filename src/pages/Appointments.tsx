import { useState, useMemo } from 'react';
import { Plus, Search, Filter, UserPlus, Calendar as CalendarIcon, Pencil, Check, ChevronsUpDown } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAppData, Appointment, Service } from '@/contexts/AppDataContext';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export default function Appointments() {
  const { clients, services, appointments, addAppointment, updateAppointment, editAppointment } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Period filter state
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined);

  // New appointment form state
  const [selectedClient, setSelectedClient] = useState('');
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Edit appointment state
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editSelectedServices, setEditSelectedServices] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);

  const handleStatusChange = async (id: string, status: Appointment['status'], reason?: string) => {
    const updateData: Partial<Appointment> = { status };
    
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      if (reason) updateData.cancelReason = reason;
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'scheduled') {
      updateData.cancelledAt = undefined;
      updateData.cancelReason = undefined;
      updateData.completedAt = undefined;
    }
    
    await updateAppointment(id, updateData);
    toast({
      title: 'Status atualizado',
      description: `Agendamento marcado como ${status === 'completed' ? 'concluído' : status === 'cancelled' ? 'cancelado' : 'agendado'}.`,
    });
  };

  // Generate 10-min time slots
  const allTimeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 8; h < 20; h++) {
      for (let m = 0; m < 60; m += 10) {
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  // Format date as YYYY-MM-DD in local timezone
  const formatLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Get booked time ranges for selected date
  const getAvailableTimeSlots = (date: Date | undefined, excludeAppointmentId?: string) => {
    if (!date) return allTimeSlots;
    
    const dateStr = formatLocalDate(date);
    const bookedRanges = appointments
      .filter(apt => {
        const aptDateStr = formatLocalDate(apt.date);
        return aptDateStr === dateStr && 
               apt.status !== 'cancelled' && 
               apt.id !== excludeAppointmentId;
      })
      .map(apt => {
        const [sh, sm] = apt.startTime.split(':').map(Number);
        const [eh, em] = apt.endTime.split(':').map(Number);
        return { start: sh * 60 + sm, end: eh * 60 + em };
      });

    return allTimeSlots.filter(slot => {
      const [h, m] = slot.split(':').map(Number);
      const slotMin = h * 60 + m;
      return !bookedRanges.some(range => slotMin >= range.start && slotMin < range.end);
    });
  };

  const availableTimeSlots = useMemo(
    () => getAvailableTimeSlots(selectedDate),
    [selectedDate, appointments]
  );

  const editAvailableTimeSlots = useMemo(
    () => getAvailableTimeSlots(editDate, editingAppointment?.id),
    [editDate, appointments, editingAppointment]
  );

  const handleCreateAppointment = async () => {
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
    const startMin = hours * 60 + minutes;
    const endTotalMin = startMin + totalDuration;
    const endHours = Math.floor(endTotalMin / 60);
    const endMinutes = endTotalMin % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    // Check for overlap with existing appointments
    const dateStr = formatLocalDate(selectedDate);
    const hasConflict = appointments.some(apt => {
      if (apt.status === 'cancelled') return false;
      const aptDateStr = formatLocalDate(apt.date);
      if (aptDateStr !== dateStr) return false;
      const [sh, sm] = apt.startTime.split(':').map(Number);
      const [eh, em] = apt.endTime.split(':').map(Number);
      const existStart = sh * 60 + sm;
      const existEnd = eh * 60 + em;
      return startMin < existEnd && endTotalMin > existStart;
    });

    if (hasConflict) {
      toast({
        title: 'Horário indisponível',
        description: 'Este horário conflita com outro agendamento existente.',
        variant: 'destructive',
      });
      return;
    }

    await addAppointment({
      clientId: selectedClient,
      clientName: client?.name || '',
      clientPhone: client?.phone || '',
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      services: selectedServicesList,
      status: 'scheduled',
      notes: notes || undefined,
    });
    
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
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const toggleEditService = (serviceId: string) => {
    setEditSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleOpenEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditSelectedServices(appointment.services.map(s => s.id));
    setEditNotes(appointment.notes || '');
    setEditTime(appointment.startTime);
    setEditDate(appointment.date);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment || editSelectedServices.length === 0) {
      toast({ title: 'Erro', description: 'Selecione pelo menos um serviço.', variant: 'destructive' });
      return;
    }

    const newServicesList = services.filter(s => editSelectedServices.includes(s.id));
    const totalDuration = newServicesList.reduce((sum, s) => sum + s.duration, 0);
    const [hours, minutes] = editTime.split(':').map(Number);
    const endTotalMin = hours * 60 + minutes + totalDuration;
    const endTime = `${Math.floor(endTotalMin / 60).toString().padStart(2, '0')}:${(endTotalMin % 60).toString().padStart(2, '0')}`;

    const success = await editAppointment(
      editingAppointment.id,
      {
        startTime: editTime,
        endTime,
        date: editDate,
        notes: editNotes || undefined,
      },
      newServicesList
    );

    if (success) {
      setIsEditDialogOpen(false);
      setEditingAppointment(null);
      toast({ title: 'Agendamento atualizado', description: 'As alterações foram salvas.' });
    }
  };

  // Monthly stats
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Agendamentos
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Gerencie todos os agendamentos da barbearia
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <ClientFormDialog 
              trigger={
                <Button variant="outline" size="default" className="w-full sm:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              }
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gold" size="default" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl">
                    Novo Agendamento
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-5 py-2">
                    {/* Client Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cliente</label>
                      <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={clientPopoverOpen}
                            className="w-full justify-between font-normal"
                          >
                            {selectedClient
                              ? clients.find(c => c.id === selectedClient)?.name || 'Selecione um cliente'
                              : 'Selecione um cliente'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Buscar cliente..." />
                            <CommandList>
                              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                              <CommandGroup>
                                {clients.map(client => (
                                  <CommandItem
                                    key={client.id}
                                    value={`${client.name} ${client.phone}`}
                                    onSelect={() => {
                                      setSelectedClient(client.id);
                                      setClientPopoverOpen(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", selectedClient === client.id ? "opacity-100" : "opacity-0")} />
                                    {client.name} - {client.phone}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <SelectContent position="popper" className="max-h-60">
                            {availableTimeSlots.map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                            {availableTimeSlots.length === 0 && (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                Sem horários disponíveis
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Serviços</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {services.map(service => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => toggleService(service.id)}
                          >
                            <Checkbox
                              checked={selectedServices.includes(service.id)}
                              onCheckedChange={() => toggleService(service.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{service.name}</p>
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
                  </div>
                </ScrollArea>
                <div className="pt-4 border-t border-border mt-2">
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
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                <SelectContent position="popper">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="scheduled">Agendados</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium">Período</label>
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <DatePickerField
                    date={startDateFilter}
                    onDateChange={setStartDateFilter}
                    placeholder="Data inicial"
                  />
                  <span className="text-muted-foreground hidden sm:inline">até</span>
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
                onEdit={handleOpenEdit}
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

        {/* Edit Appointment Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingAppointment(null);
        }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                Editar Agendamento
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-5 py-2">
                {editingAppointment && (
                  <>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-sm font-medium">{editingAppointment.clientName}</p>
                      <p className="text-xs text-muted-foreground">{editingAppointment.clientPhone}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data</label>
                        <DatePickerField
                          date={editDate}
                          onDateChange={setEditDate}
                          placeholder="Data"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Horário</label>
                        <Select value={editTime} onValueChange={setEditTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Horário" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="max-h-60">
                            {editAvailableTimeSlots.map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Serviços</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {services.map(service => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                            onClick={() => toggleEditService(service.id)}
                          >
                            <Checkbox
                              checked={editSelectedServices.includes(service.id)}
                              onCheckedChange={() => toggleEditService(service.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{service.name}</p>
                              <p className="text-xs text-muted-foreground">
                                R$ {service.price} • {service.duration}min
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Observações</label>
                      <Input
                        placeholder="Observações..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                      />
                    </div>

                    <Button variant="gold" className="w-full" onClick={handleSaveEdit}>
                      Salvar Alterações
                    </Button>
                  </>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
