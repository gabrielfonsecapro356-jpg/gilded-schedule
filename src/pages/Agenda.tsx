import { useState, useMemo } from 'react';
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

  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const dayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDateStr = apt.date.toISOString().split('T')[0];
      return aptDateStr === selectedDateStr;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDateStr]);

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

  const goToToday = () => setSelectedDate(new Date());

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Generate 30-min slots for display
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${min}`;
  }).filter(t => {
    const [h] = t.split(':').map(Number);
    return h >= 8 && h < 21;
  });

  const getAppointmentForTime = (time: string) => {
    return dayAppointments.find(apt => {
      if (apt.status === 'cancelled') return false;
      const [slotH, slotM] = time.split(':').map(Number);
      const [startH, startM] = apt.startTime.split(':').map(Number);
      const [endH, endM] = apt.endTime.split(':').map(Number);
      const slotMin = slotH * 60 + slotM;
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      return slotMin >= startMin && slotMin < endMin;
    });
  };

  const isSlotStart = (time: string) => {
    return dayAppointments.some(apt => apt.startTime === time && apt.status !== 'cancelled');
  };

  const activeAppointments = dayAppointments.filter(a => a.status !== 'cancelled');
  const completedAppointments = dayAppointments.filter(a => a.status === 'completed');
  const scheduledAppointments = dayAppointments.filter(a => a.status === 'scheduled');
  const totalRevenue = completedAppointments.reduce((sum, a) => 
    sum + a.services.reduce((s, svc) => s + svc.price, 0), 0
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Agenda do Dia
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Visualize e gerencie os atendimentos do dia
          </p>
        </div>

        {/* Summary Stats */}
        <Card className="p-4 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl md:text-2xl font-heading font-bold text-gradient-gold">
                {activeAppointments.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Ativos</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-heading font-bold text-foreground">
                {scheduledAppointments.length}
              </p>
              <p className="text-xs text-muted-foreground">Agendados</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-heading font-bold text-green-500">
                {completedAppointments.length}
              </p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-heading font-bold text-foreground">
                R$ {totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Faturamento</p>
            </div>
          </div>
        </Card>

        {/* Date Navigation */}
        <Card variant="gold" className="p-3 md:p-4">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={goToPreviousDay} className="flex-shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 min-w-0">
              <div className="text-center min-w-0">
                <p className="text-lg md:text-2xl font-heading font-bold text-foreground truncate">
                  {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                </p>
                <p className="text-sm md:text-lg text-gradient-gold font-medium">
                  {selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Hoje
                  </Button>
                )}
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={goToNextDay} className="flex-shrink-0">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Timeline View */}
        <div className="space-y-1">
          {timeSlots.map((time) => {
            const appointment = getAppointmentForTime(time);
            const showCard = appointment && isSlotStart(time);
            const isOccupied = !!appointment;
            
            return (
              <div key={time} className="flex gap-2 md:gap-4 min-h-[40px]">
                <div className="w-14 md:w-20 flex-shrink-0 text-right">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">
                    {time}
                  </span>
                </div>
                
                <div className={`flex-1 border-l-2 pl-3 md:pl-4 pb-1 ${isOccupied ? 'border-primary/50' : 'border-border'}`}>
                  {showCard ? (
                    <AppointmentCard
                      appointment={appointment}
                      onStatusChange={handleStatusChange}
                    />
                  ) : isOccupied ? null : (
                    <div className="h-8 flex items-center">
                      <span className="text-xs text-muted-foreground/40">
                        Disponível
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
