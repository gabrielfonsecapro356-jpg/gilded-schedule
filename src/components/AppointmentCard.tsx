import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Phone, CheckCircle, XCircle, AlertCircle, Edit2 } from 'lucide-react';
import { Appointment } from '@/types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ConfirmationDialog } from './ConfirmationDialog';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange?: (id: string, status: Appointment['status'], reason?: string) => void;
  showCancelledSlot?: boolean;
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

export function AppointmentCard({ appointment, onStatusChange, showCancelledSlot = false }: AppointmentCardProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editStatus, setEditStatus] = useState<Appointment['status'] | null>(null);

  const status = statusConfig[appointment.status];
  const StatusIcon = status.icon;
  const totalPrice = appointment.services.reduce((sum, s) => sum + s.price, 0);

  const handleComplete = () => {
    onStatusChange?.(appointment.id, 'completed');
  };

  const handleCancel = (reason?: string) => {
    onStatusChange?.(appointment.id, 'cancelled', reason);
  };

  const handleEditStatus = (newStatus: Appointment['status']) => {
    setEditStatus(newStatus);
    setShowEditDialog(true);
  };

  const confirmEditStatus = (reason?: string) => {
    if (editStatus) {
      onStatusChange?.(appointment.id, editStatus, reason);
    }
    setEditStatus(null);
  };

  // For cancelled appointments, show a simplified view or nothing based on showCancelledSlot
  if (appointment.status === 'cancelled' && !showCancelledSlot) {
    return (
      <Card className="p-4 animate-fade-in border-dashed border-red-500/30 bg-red-500/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium line-through">{appointment.startTime} - {appointment.endTime}</span>
              <span className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ml-2",
                status.className
              )}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-through">{appointment.clientName}</p>
            
            {/* Cancellation info */}
            {appointment.cancelledAt && (
              <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400">
                  Cancelado em: {format(new Date(appointment.cancelledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                {appointment.cancelReason && (
                  <p className="text-xs text-red-400 mt-1">
                    Motivo: {appointment.cancelReason}
                  </p>
                )}
              </div>
            )}
            
            {/* Edit status button */}
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditStatus('scheduled')}
                className="text-xs"
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Reagendar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
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
                  <span className="font-medium">
                    {format(appointment.date, "dd/MM", { locale: ptBR })} • {appointment.startTime} - {appointment.endTime}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground">
                  {appointment.clientName}
                </h3>
              </div>
              {/* Only show badge for non-scheduled status */}
              {appointment.status !== 'scheduled' && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                  status.className
                )}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </div>
              )}
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

            {/* Completed info */}
            {appointment.status === 'completed' && appointment.completedAt && (
              <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-400">
                  Concluído em: {format(new Date(appointment.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
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
                    onClick={() => setShowCancelDialog(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="gold"
                    onClick={() => setShowCompleteDialog(true)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Concluir
                  </Button>
                </div>
              )}
              {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditStatus('scheduled')}
                  className="text-xs"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Alterar Status
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Complete Confirmation Dialog */}
      <ConfirmationDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        title="Concluir Atendimento"
        description={`Confirma a conclusão do atendimento de ${appointment.clientName}? O valor de R$ ${totalPrice.toFixed(2)} será registrado no faturamento.`}
        confirmLabel="Confirmar Conclusão"
        onConfirm={handleComplete}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancelar Agendamento"
        description={`Tem certeza que deseja cancelar o agendamento de ${appointment.clientName}?`}
        confirmLabel="Confirmar Cancelamento"
        onConfirm={handleCancel}
        variant="destructive"
        showReasonInput
        reasonPlaceholder="Motivo do cancelamento (opcional)..."
      />

      {/* Edit Status Dialog */}
      <ConfirmationDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Alterar Status"
        description={`Deseja alterar o status do agendamento de ${appointment.clientName} para "Agendado"?`}
        confirmLabel="Confirmar Alteração"
        onConfirm={confirmEditStatus}
      />
    </>
  );
}