import { 
  Calendar, 
  Users, 
  Scissors, 
  TrendingUp, 
  Clock,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientFormDialog } from '@/components/ClientFormDialog';
import { useAppData } from '@/contexts/AppDataContext';
import { Appointment } from '@/types';

export default function Dashboard() {
  const { services, appointments, updateAppointment, settings } = useAppData();
  const today = new Date();

  const todayAppointments = appointments.filter(
    apt => apt.date.toDateString() === today.toDateString()
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleStatusChange = (id: string, status: Appointment['status']) => {
    updateAppointment(id, { status });
  };

  const completedToday = todayAppointments.filter(a => a.status === 'completed').length;
  const upcomingToday = todayAppointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;
  const totalRevenue = todayAppointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.services.reduce((s, svc) => s + svc.price, 0), 0);

  const nextAppointment = todayAppointments.find(
    a => a.status === 'scheduled' || a.status === 'confirmed'
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {today.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-primary mt-1">
              {settings.shopName} • {settings.openTime} - {settings.closeTime}
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
            <Link to="/appointments">
              <Button variant="gold" size="lg">
                <Calendar className="w-5 h-5 mr-2" />
                Novo Agendamento
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Agendamentos Hoje"
            value={todayAppointments.length}
            subtitle={`${completedToday} concluídos`}
            icon={<Calendar className="w-6 h-6 text-primary" />}
            variant="gold"
          />
          <StatCard
            title="Próximos"
            value={upcomingToday}
            subtitle="aguardando atendimento"
            icon={<Clock className="w-6 h-6 text-primary" />}
          />
          <StatCard
            title="Faturamento Hoje"
            value={`R$ ${totalRevenue.toFixed(2)}`}
            subtitle="em serviços realizados"
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Serviços Oferecidos"
            value={services.length}
            subtitle="tipos disponíveis"
            icon={<Scissors className="w-6 h-6 text-primary" />}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Agenda de Hoje
              </h2>
              <Link to="/agenda" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1">
                Ver completa <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.slice(0, 3).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {todayAppointments.length > 3 && (
                  <Link to="/agenda">
                    <Button variant="outline" className="w-full">
                      Ver mais {todayAppointments.length - 3} agendamentos
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum agendamento para hoje
                </p>
              </Card>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Next Appointment */}
            {nextAppointment && (
              <Card variant="gold" className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Próximo Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-3xl font-heading font-bold text-gradient-gold">
                      {nextAppointment.startTime}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {nextAppointment.clientName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {nextAppointment.clientPhone}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {nextAppointment.services.map((s) => (
                        <span
                          key={s.id}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Serviços Mais Populares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.slice(0, 4).map((service, index) => (
                  <div key={service.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">
                        {service.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        R$ {service.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
