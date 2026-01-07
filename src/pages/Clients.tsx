import { useState } from 'react';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAppData } from '@/contexts/AppDataContext';
import { Client } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { formatPhone, isValidPhone, isValidEmail, validationMessages } from '@/lib/validation';

export default function Clients() {
  const { clients, addClient, appointments } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // New client form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const resetForm = () => {
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setPhoneError('');
    setEmailError('');
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setNewPhone(formatted);
    if (formatted && !isValidPhone(formatted)) {
      setPhoneError(validationMessages.phone);
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (value: string) => {
    setNewEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError(validationMessages.email);
    } else {
      setEmailError('');
    }
  };

  const handleCreateClient = () => {
    if (!newName.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!newPhone || !isValidPhone(newPhone)) {
      toast({
        title: 'Erro',
        description: validationMessages.phone,
        variant: 'destructive',
      });
      return;
    }

    if (newEmail && !isValidEmail(newEmail)) {
      toast({
        title: 'Erro',
        description: validationMessages.email,
        variant: 'destructive',
      });
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone,
      email: newEmail.trim() || undefined,
      createdAt: new Date(),
    };

    addClient(newClient);
    setIsDialogOpen(false);
    resetForm();
    
    toast({
      title: 'Cliente cadastrado',
      description: `${newName} foi adicionado com sucesso.`,
    });
  };

  const getClientStats = (clientId: string) => {
    const clientAppointments = appointments.filter(
      apt => apt.clientId === clientId
    );
    const totalSpent = clientAppointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + apt.services.reduce((s, svc) => s + svc.price, 0), 0);
    return {
      totalAppointments: clientAppointments.length,
      totalSpent,
    };
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Clientes
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie o cadastro de clientes da barbearia
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="gold" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  Novo Cliente
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome *</label>
                  <Input
                    placeholder="Nome completo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone *</label>
                  <Input
                    placeholder="(99) 99999-9999"
                    value={newPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={15}
                  />
                  {phoneError && (
                    <p className="text-xs text-destructive">{phoneError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                  {emailError && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                </div>
                <Button variant="gold" className="w-full" onClick={handleCreateClient}>
                  Cadastrar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const stats = getClientStats(client.id);
            return (
              <Card key={client.id} variant="elevated" className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {client.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Cliente desde {client.createdAt.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                    )}
                  </div>
                  <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xl font-heading font-bold text-foreground">
                        {stats.totalAppointments}
                      </p>
                      <p className="text-xs text-muted-foreground">Atendimentos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-heading font-bold text-gradient-gold">
                        R$ {stats.totalSpent.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Total gasto</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredClients.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhum cliente encontrado
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
