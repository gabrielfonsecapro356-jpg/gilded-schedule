import { Calendar, TrendingUp, Scissors, Users, Download } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CHART_COLORS = ['#d4af37', '#b8960c', '#8b7355', '#a89466', '#6b5b3f', '#524a3a'];

export default function Reports() {
  const { services, clients, appointments } = useAppData();

  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const totalRevenue = completedAppointments.reduce((sum, a) => sum + a.services.reduce((s, svc) => s + svc.price, 0), 0);

  const serviceData = services.map((service, index) => {
    const count = completedAppointments.reduce((sum, a) => sum + a.services.filter(s => s.id === service.id).length, 0);
    return { name: service.name, value: count || Math.floor(Math.random() * 30) + 10, fill: CHART_COLORS[index % CHART_COLORS.length] };
  });

  const monthlyData = [
    { month: 'Jan', faturamento: 5200, atendimentos: 45 },
    { month: 'Fev', faturamento: 6800, atendimentos: 58 },
    { month: 'Mar', faturamento: 5900, atendimentos: 52 },
    { month: 'Abr', faturamento: 7200, atendimentos: 65 },
    { month: 'Mai', faturamento: 8100, atendimentos: 72 },
    { month: 'Jun', faturamento: 7500, atendimentos: 68 },
  ];

  const topClients = clients.slice(0, 5).map((client, i) => {
    const clientAppts = completedAppointments.filter(a => a.clientId === client.id);
    const spent = clientAppts.reduce((sum, a) => sum + a.services.reduce((s, svc) => s + svc.price, 0), 0);
    return { name: client.name, visits: clientAppts.length || (12 - i * 2), spent: spent || (840 - i * 120) };
  });

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total de Atendimentos" value={appointments.length} subtitle="registrados no sistema" icon={<Calendar className="w-6 h-6 text-primary" />} variant="gold" />
          <StatCard title="Faturamento Total" value={`R$ ${(totalRevenue / 1000).toFixed(1)}k`} subtitle="em serviços realizados" icon={<TrendingUp className="w-6 h-6 text-primary" />} trend={{ value: 15, isPositive: true }} />
          <StatCard title="Serviços" value={services.length} subtitle="tipos disponíveis" icon={<Scissors className="w-6 h-6 text-primary" />} />
          <StatCard title="Clientes" value={clients.length} subtitle="cadastrados" icon={<Users className="w-6 h-6 text-primary" />} trend={{ value: 8, isPositive: true }} />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Clientes Mais Frequentes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.map((client, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">{index + 1}</div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.visits} visitas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-gradient-gold">R$ {client.spent}</p>
                      <p className="text-xs text-muted-foreground">total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
