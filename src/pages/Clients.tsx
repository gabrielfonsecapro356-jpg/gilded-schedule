import { useState } from 'react';
import { Plus, Search, Phone, Mail, Pencil, Trash2 } from 'lucide-react';
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
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { useToast } from '@/hooks/use-toast';
import { formatPhone, isValidPhone, isValidEmail, validationMessages } from '@/lib/validation';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient, appointments } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { toast } = useToast();

  // New client form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // Edit client form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneError, setEditPhoneError] = useState('');
  const [editEmailError, setEditEmailError] = useState('');

  const resetForm = () => {
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setPhoneError('');
    setEmailError('');
  };

  const resetEditForm = () => {
    setEditName('');
    setEditPhone('');
    setEditEmail('');
    setEditPhoneError('');
    setEditEmailError('');
    setSelectedClient(null);
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

  const handleEditPhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setEditPhone(formatted);
    if (formatted && !isValidPhone(formatted)) {
      setEditPhoneError(validationMessages.phone);
    } else {
      setEditPhoneError('');
    }
  };

  const handleEditEmailChange = (value: string) => {
    setEditEmail(value);
    if (value && !isValidEmail(value)) {
      setEditEmailError(validationMessages.email);
    } else {
      setEditEmailError('');
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

  const handleOpenEditDialog = (client: Client) => {
    setSelectedClient(client);
    setEditName(client.name);
    setEditPhone(client.phone);
    setEditEmail(client.email || '');
    setEditPhoneError('');
    setEditEmailError('');
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = () => {
    if (!selectedClient) return;

    if (!editName.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!editPhone || !isValidPhone(editPhone)) {
      toast({
        title: 'Erro',
        description: validationMessages.phone,
        variant: 'destructive',
      });
      return;
    }

    if (editEmail && !isValidEmail(editEmail)) {
      toast({
        title: 'Erro',
        description: validationMessages.email,
        variant: 'destructive',
      });
      return;
    }

    updateClient(selectedClient.id, {
      name: editName.trim(),
      phone: editPhone,
      email: editEmail.trim() || undefined,
    });

    setIsEditDialogOpen(false);
    resetEditForm();
    
    toast({
      title: 'Cliente atualizado',
      description: `${editName} foi atualizado com sucesso.`,
    });
  };

  const handleOpenDeleteDialog = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClient = () => {
    if (!selectedClient) return;

    deleteClient(selectedClient.id);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: 'Cliente excluído',
      description: `${selectedClient.name} foi removido com sucesso.`,
    });

    setSelectedClient(null);
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEditDialog(client)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleOpenDeleteDialog(client)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) resetEditForm();
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                Editar Cliente
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  placeholder="Nome completo"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone *</label>
                <Input
                  placeholder="(99) 99999-9999"
                  value={editPhone}
                  onChange={(e) => handleEditPhoneChange(e.target.value)}
                  maxLength={15}
                />
                {editPhoneError && (
                  <p className="text-xs text-destructive">{editPhoneError}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={editEmail}
                  onChange={(e) => handleEditEmailChange(e.target.value)}
                />
                {editEmailError && (
                  <p className="text-xs text-destructive">{editEmailError}</p>
                )}
              </div>
              <Button variant="gold" className="w-full" onClick={handleUpdateClient}>
                Salvar Alterações
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Excluir Cliente"
          description={`Tem certeza que deseja excluir ${selectedClient?.name}? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={handleDeleteClient}
        />
      </div>
    </Layout>
  );
}
