import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getAppointmentsByDate } from '@/data/mockData';
import { Appointment } from '@/types';

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(getAppointmentsByDate(selectedDate));
  }, [selectedDate]);

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, status } : apt)
    );
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
    return appointments.find(apt => {
      const [aptHour] = apt.startTime.split(':').map(Number);
      const [slotHour] = time.split(':').map(Number);
      return aptHour === slotHour;
    });
  };

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
              {!isToday && (
                <Button variant="outline" size="sm" onClick={goToToday}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Hoje
                </Button>
              )}
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
                    <AppointmentCard
                      appointment={appointment}
                      onStatusChange={handleStatusChange}
                    />
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

        {/* Summary */}
        <Card className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-heading font-bold text-gradient-gold">
                {appointments.length}
              </p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
              <p className="text-sm text-muted-foreground">Confirmados</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-green-500">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">Concluídos</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {appointments.reduce((sum, a) => 
                  sum + a.services.reduce((s, svc) => s + svc.price, 0), 0
                ).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Faturamento</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
