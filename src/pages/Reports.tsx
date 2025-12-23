import { useState } from 'react';
import { Calendar, TrendingUp, Scissors, Users, Download } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMonthlyStats, SERVICES, MOCK_APPOINTMENTS } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const CHART_COLORS = ['#d4af37', '#b8960c', '#8b7355', '#a89466', '#6b5b3f', '#524a3a'];

export default function Reports() {
  const monthlyStats = getMonthlyStats();
  
  const totalAppointments = monthlyStats.reduce((sum, m) => sum + m.totalAppointments, 0);
  const totalRevenue = monthlyStats.reduce((sum, m) => sum + m.revenue, 0);
  const avgAppointmentsPerMonth = Math.round(totalAppointments / monthlyStats.length);

  const serviceData = SERVICES.slice(0, 6).map((service, index) => ({
    name: service.name,
    value: Math.floor(Math.random() * 50) + 20,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const revenueData = monthlyStats.map(m => ({
    month: m.month,
    faturamento: m.revenue,
    atendimentos: m.totalAppointments,
  }));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">
              Métricas e análises de desempenho da barbearia
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Atendimentos"
            value={totalAppointments}
            subtitle="nos últimos 6 meses"
            icon={<Calendar className="w-6 h-6 text-primary" />}
            variant="gold"
          />
          <StatCard
            title="Faturamento Total"
            value={`R$ ${(totalRevenue / 1000).toFixed(1)}k`}
            subtitle="nos últimos 6 meses"
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Média Mensal"
            value={avgAppointmentsPerMonth}
            subtitle="atendimentos por mês"
            icon={<Scissors className="w-6 h-6 text-primary" />}
          />
          <StatCard
            title="Clientes Ativos"
            value="127"
            subtitle="nos últimos 3 meses"
            icon={<Users className="w-6 h-6 text-primary" />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                    />
                    <Line
                      type="monotone"
                      dataKey="faturamento"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Appointments Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atendimentos por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar 
                      dataKey="atendimentos" 
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Serviços Mais Realizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {serviceData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clientes Mais Frequentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'João Silva', visits: 12, spent: 840 },
                  { name: 'Carlos Santos', visits: 10, spent: 720 },
                  { name: 'Pedro Oliveira', visits: 8, spent: 560 },
                  { name: 'Lucas Ferreira', visits: 7, spent: 490 },
                  { name: 'Marcos Lima', visits: 6, spent: 420 },
                ].map((client, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.visits} visitas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-gradient-gold">
                        R$ {client.spent}
                      </p>
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
