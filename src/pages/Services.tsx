import { useState } from 'react';
import { Plus, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SERVICES } from '@/data/mockData';
import { Service } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function Services() {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');

  const resetForm = () => {
    setName('');
    setDuration('');
    setPrice('');
    setEditingService(null);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDuration(service.duration.toString());
    setPrice(service.price.toString());
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!name || !duration || !price) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    if (editingService) {
      setServices(prev =>
        prev.map(s =>
          s.id === editingService.id
            ? { ...s, name, duration: parseInt(duration), price: parseFloat(price) }
            : s
        )
      );
      toast({
        title: 'Serviço atualizado',
        description: `${name} foi atualizado com sucesso.`,
      });
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        name,
        duration: parseInt(duration),
        price: parseFloat(price),
      };
      setServices(prev => [...prev, newService]);
      toast({
        title: 'Serviço criado',
        description: `${name} foi adicionado com sucesso.`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (service: Service) => {
    setServices(prev => prev.filter(s => s.id !== service.id));
    toast({
      title: 'Serviço removido',
      description: `${service.name} foi removido.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Serviços
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os serviços oferecidos pela barbearia
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="gold" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Serviço</label>
                  <Input
                    placeholder="Ex: Corte de Cabelo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duração (minutos)</label>
                    <Input
                      type="number"
                      placeholder="45"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preço (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="gold" className="w-full" onClick={handleSave}>
                  {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.id} 
              variant="elevated" 
              className="animate-fade-in overflow-hidden group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">
                      {service.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(service)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                  {service.name}
                </h3>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {service.duration} min
                  </div>
                  <div className="flex items-center gap-1 text-lg font-heading font-bold text-gradient-gold">
                    <DollarSign className="w-4 h-4" />
                    {service.price.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhum serviço cadastrado
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
