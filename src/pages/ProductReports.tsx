import { Calendar, TrendingUp, Package, DollarSign, Download, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
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

const CHART_COLORS = ['#d4af37', '#b8960c', '#8b7355', '#a89466', '#6b5b3f', '#524a3a', '#3d3a2f', '#2e2c24'];

export default function ProductReports() {
  const { products } = useAppData();

  // Calculate metrics
  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.soldCount), 0);
  const totalCost = products.reduce((sum, p) => sum + (p.cost * p.soldCount), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalSold = products.reduce((sum, p) => sum + p.soldCount, 0);
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // Top selling products
  const topProducts = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 8)
    .map((p, index) => ({
      name: p.name,
      vendidos: p.soldCount,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

  // Revenue by category
  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(c => c.category === p.category);
    const revenue = p.price * p.soldCount;
    if (existing) {
      existing.faturamento += revenue;
    } else {
      acc.push({ category: p.category, faturamento: revenue });
    }
    return acc;
  }, [] as { category: string; faturamento: number }[]);

  // Monthly simulation data (would come from real data in production)
  const monthlyData = [
    { month: 'Jan', faturamento: 2500, custo: 1100, lucro: 1400 },
    { month: 'Fev', faturamento: 3200, custo: 1400, lucro: 1800 },
    { month: 'Mar', faturamento: 2800, custo: 1200, lucro: 1600 },
    { month: 'Abr', faturamento: 3500, custo: 1500, lucro: 2000 },
    { month: 'Mai', faturamento: 4100, custo: 1800, lucro: 2300 },
    { month: 'Jun', faturamento: 3800, custo: 1650, lucro: 2150 },
  ];

  // Products needing restock
  const needsRestock = products.filter(p => p.stock <= p.minStock);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Relatório de Produtos
            </h1>
            <p className="text-muted-foreground mt-1">
              Métricas de vendas e estoque de produtos
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
            title="Faturamento Produtos"
            value={`R$ ${(totalRevenue / 1000).toFixed(1)}k`}
            subtitle="total de vendas"
            icon={<DollarSign className="w-6 h-6 text-primary" />}
            variant="gold"
          />
          <StatCard
            title="Lucro Total"
            value={`R$ ${(totalProfit / 1000).toFixed(1)}k`}
            subtitle={`margem de ${((totalProfit / totalRevenue) * 100).toFixed(0)}%`}
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Custos"
            value={`R$ ${(totalCost / 1000).toFixed(1)}k`}
            subtitle="custo dos produtos"
            icon={<Calendar className="w-6 h-6 text-primary" />}
          />
          <StatCard
            title="Produtos Vendidos"
            value={totalSold}
            subtitle={`${totalStock} em estoque`}
            icon={<Package className="w-6 h-6 text-primary" />}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faturamento x Lucro Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        `R$ ${value.toFixed(2)}`,
                        name === 'faturamento' ? 'Faturamento' : name === 'lucro' ? 'Lucro' : 'Custo'
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="faturamento"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="lucro"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      width={100}
                      tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} un`, 'Vendidos']}
                    />
                    <Bar 
                      dataKey="vendidos" 
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Faturamento por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="faturamento"
                      nameKey="category"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate">{item.category}</span>
                    <span className="font-medium ml-auto">R$ {item.faturamento.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Needing Restock */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Produtos para Repor ({needsRestock.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {needsRestock.length > 0 ? (
                <div className="space-y-3">
                  {needsRestock.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                    >
                      <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                        <Package className="w-5 h-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold text-destructive">
                          {product.stock} un
                        </p>
                        <p className="text-xs text-muted-foreground">
                          min: {product.minStock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Todos os produtos estão com estoque adequado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
