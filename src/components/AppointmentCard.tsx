import { Clock, Phone, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Appointment } from '@/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange?: (id: string, status: Appointment['status']) => void;
}

const statusConfig = {
  scheduled: {
    label: 'Agendado',
    icon: AlertCircle,
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  confirmed: {
    label: 'Confirmado',
    icon: CheckCircle,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    className: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const status = statusConfig[appointment.status];
  const StatusIcon = status.icon;
  const totalPrice = appointment.services.reduce((sum, s) => sum + s.price, 0);

  return (
    <Card variant="elevated" className="p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        {/* Time indicator */}
        <div className="flex flex-col items-center min-w-[60px]">
          <div className="w-3 h-3 rounded-full bg-gradient-gold shadow-gold" />
          <div className="w-0.5 h-full bg-border mt-2" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{appointment.startTime} - {appointment.endTime}</span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                {appointment.clientName}
              </h3>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              status.className
            )}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {appointment.clientPhone}
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-2">
            {appointment.services.map((service) => (
              <span
                key={service.id}
                className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
              >
                {service.name}
              </span>
            ))}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-3">
              {appointment.notes}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-lg font-heading font-bold text-gradient-gold">
              R$ {totalPrice.toFixed(2)}
            </span>
            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onStatusChange?.(appointment.id, 'cancelled')}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="gold"
                  onClick={() => onStatusChange?.(appointment.id, 'completed')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Concluir
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
