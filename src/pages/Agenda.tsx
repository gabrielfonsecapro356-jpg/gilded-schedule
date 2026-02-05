import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppData, Appointment } from '@/contexts/AppDataContext';
import { DatePickerField } from '@/components/DatePickerField';

export default function Agenda() {
  const { appointments, updateAppointment } = useAppData();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get appointments for selected date from context
  const dayAppointments = appointments.filter(
    apt => apt.date.toDateString() === selectedDate.toDateString()
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleStatusChange = async (id: string, status: Appointment['status'], reason?: string) => {
    const updateData: Partial<Appointment> = { status };
    
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
      if (reason) {
        updateData.cancelReason = reason;
      }
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status === 'scheduled') {
      // Resetting status - clear previous timestamps
      updateData.cancelledAt = undefined;
      updateData.cancelReason = undefined;
      updateData.completedAt = undefined;
    }
    
    await updateAppointment(id, updateData);
  };

  const goToPreviousDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Generate time slots from 8:00 to 20:00
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = 8 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const getAppointmentForTime = (time: string) => {
    return dayAppointments.find(apt => {
      const [aptHour] = apt.startTime.split(':').map(Number);
      const [slotHour] = time.split(':').map(Number);
      return aptHour === slotHour;
    });
  };

  // Calculate stats - exclude cancelled from totals
  const activeAppointments = dayAppointments.filter(a => a.status !== 'cancelled');
  const completedAppointments = dayAppointments.filter(a => a.status === 'completed');
  const scheduledAppointments = dayAppointments.filter(a => a.status === 'scheduled');
  
  // Revenue only counts completed appointments
  const totalRevenue = completedAppointments.reduce((sum, a) => 
    sum + a.services.reduce((s, svc) => s + svc.price, 0), 0
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Agenda do Dia
            </h1>
            <p className="text-muted-foreground mt-1">
              Visualize e gerencie os atendimentos do dia
            </p>
          </div>
        </div>

        {/* Summary Stats - at top like Appointments page */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-heading font-bold text-gradient-gold">
                {activeAppointments.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Ativos</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                {scheduledAppointments.length}
              </p>
              <p className="text-sm text-muted-foreground">Agendados</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-green-500">
                {completedAppointments.length}
              </p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Faturamento</p>
            </div>
          </div>
        </Card>

        {/* Date Navigation */}
        <Card variant="gold" className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-heading font-bold text-foreground">
                  {selectedDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long'
                  })}
                </p>
                <p className="text-lg text-gradient-gold font-medium">
                  {selectedDate.toLocaleDateString('pt-BR', { 
                    day: 'numeric',
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <DatePickerField
                  date={selectedDate}
                  onDateChange={(date) => date && setSelectedDate(date)}
                  className="w-auto"
                />
                {!isToday && (
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Hoje
                  </Button>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={goToNextDay}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Timeline View */}
        <div className="space-y-2">
          {timeSlots.map((time) => {
            const appointment = getAppointmentForTime(time);
            
            return (
              <div key={time} className="flex gap-4 min-h-[80px]">
                {/* Time indicator */}
                <div className="w-20 flex-shrink-0 text-right">
                  <span className="text-sm font-medium text-muted-foreground">
                    {time}
                  </span>
                </div>
                
                {/* Content area */}
                <div className="flex-1 border-l-2 border-border pl-4 pb-4">
                  {appointment ? (
                    appointment.status === 'cancelled' ? (
                      // Show available slot for cancelled appointments
                      <div className="h-16 flex items-center">
                        <span className="text-sm text-muted-foreground/50">
                          Horário disponível
                        </span>
                        <span className="text-xs text-red-400/50 ml-2">
                          (cancelado: {appointment.clientName})
                        </span>
                      </div>
                    ) : (
                      <AppointmentCard
                        appointment={appointment}
                        onStatusChange={handleStatusChange}
                      />
                    )
                  ) : (
                    <div className="h-16 flex items-center">
                      <span className="text-sm text-muted-foreground/50">
                        Horário disponível
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </Layout>
  );
}