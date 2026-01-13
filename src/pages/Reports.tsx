import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Scissors, Users, Download } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { DatePickerField } from '@/components/DatePickerField';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CHART_COLORS = ['#d4af37', '#b8960c', '#8b7355', '#a89466', '#6b5b3f', '#524a3a'];

export default function Reports() {
  const { services, clients, appointments } = useAppData();
  
  // Period filter
  const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()));

  // Filter appointments by period and completed status
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      let inPeriod = true;
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        inPeriod = aptDate >= start;
      }
      if (inPeriod && endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        inPeriod = aptDate <= end;
      }
      return inPeriod;
    });
  }, [appointments, startDate, endDate]);

  const completedAppointments = filteredAppointments.filter(a => a.status === 'completed');
  const totalRevenue = completedAppointments.reduce((sum, a) => sum + a.services.reduce((s, svc) => s + svc.price, 0), 0);
  const totalAppointmentsCount = filteredAppointments.filter(a => a.status !== 'cancelled').length;

  // Service popularity data
  const serviceData = services.map((service, index) => {
    const count = completedAppointments.reduce((sum, a) => sum + a.services.filter(s => s.id === service.id).length, 0);
    return { name: service.name, value: count, fill: CHART_COLORS[index % CHART_COLORS.length] };
  }).filter(s => s.value > 0);

  // Monthly data for charts (last 6 months)
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthAppts = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= monthStart && aptDate <= monthEnd && apt.status === 'completed';
      });
      
      const revenue = monthAppts.reduce((sum, a) => sum + a.services.reduce((s, svc) => s + svc.price, 0), 0);
      
      months.push({
        month: format(monthDate, 'MMM', { locale: ptBR }),
        faturamento: revenue,
        atendimentos: monthAppts.length,
      });
    }
    return months;
  }, [appointments]);

  // Top clients
  const topClients = useMemo(() => {
    const clientStats = clients.map(client => {
      const clientAppts = completedAppointments.filter(a => a.clientId === client.id);
      const spent = clientAppts.reduce((sum, a) => sum + a.services.reduce((s, svc) => s + svc.price, 0), 0);
      return { name: client.name, visits: clientAppts.length, spent };
    }).filter(c => c.visits > 0);
    
    return clientStats.sort((a, b) => b.spent - a.spent).slice(0, 5);
  }, [clients, completedAppointments]);

  const clearFilters = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(endOfMonth(new Date()));
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1">Métricas e análises de desempenho da barbearia</p>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exportar Relatório</Button>
        </div>

        {/* Period Filter */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Período de Análise</label>
              <div className="flex gap-2 items-center">
                <DatePickerField
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Data inicial"
                />
                <span className="text-muted-foreground">até</span>
                <DatePickerField
                  date={endDate}
                  onDateChange={setEndDate}
                  placeholder="Data final"
                />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Mês atual
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total de Atendimentos" 
            value={totalAppointmentsCount} 
            subtitle="no período selecionado" 
            icon={<Calendar className="w-6 h-6 text-primary" />} 
            variant="gold" 
          />
          <StatCard 
            title="Atendimentos Concluídos" 
            value={completedAppointments.length} 
            subtitle="finalizados com sucesso" 
            icon={<Calendar className="w-6 h-6 text-primary" />} 
          />
          <StatCard 
            title="Faturamento Total" 
            value={`R$ ${totalRevenue.toFixed(2)}`} 
            subtitle="em serviços concluídos" 
            icon={<TrendingUp className="w-6 h-6 text-primary" />} 
            trend={{ value: 15, isPositive: true }} 
          />
          <StatCard 
            title="Clientes Ativos" 
            value={new Set(completedAppointments.map(a => a.clientId)).size} 
            subtitle="no período" 
            icon={<Users className="w-6 h-6 text-primary" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle className="text-lg">Faturamento Mensal</CardTitle></CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="faturamento" stroke="hsl(var(--primary))" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Atendimentos por Mês</CardTitle></CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="atendimentos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle className="text-lg">Serviços Mais Realizados</CardTitle></CardHeader>
            <CardContent>
              {serviceData.length > 0 ? (
                <>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={serviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                          {serviceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {serviceData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-muted-foreground truncate">{item.name}</span>
                        <span className="font-medium ml-auto">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Nenhum serviço concluído no período
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Clientes Mais Frequentes</CardTitle></CardHeader>
            <CardContent>
              {topClients.length > 0 ? (
                <div className="space-y-4">
                  {topClients.map((client, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">{index + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.visits} visitas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold text-gradient-gold">R$ {client.spent.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">total</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum cliente com atendimentos no período
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}