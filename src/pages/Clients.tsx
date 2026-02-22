import { useState, useMemo } from 'react';
import { Plus, Search, Phone, Mail, Pencil, Trash2, Users, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppData, Client } from '@/contexts/AppDataContext';
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

type ActivityLevel = 'active' | 'yellow' | 'orange' | 'red' | 'new';

function getClientActivity(clientId: string, appointments: any[]): { level: ActivityLevel; days: number | null; label: string } {
  const clientApts = appointments
    .filter(a => a.clientId === clientId && a.status === 'completed')
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (clientApts.length === 0) {
    return { level: 'new', days: null, label: 'Novo' };
  }

  const lastDate = new Date(clientApts[0].date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 40) return { level: 'red', days: diffDays, label: `${diffDays}d ausente` };
  if (diffDays >= 30) return { level: 'orange', days: diffDays, label: `${diffDays}d ausente` };
  if (diffDays >= 20) return { level: 'yellow', days: diffDays, label: `${diffDays}d ausente` };
  return { level: 'active', days: diffDays, label: 'Ativo' };
}

const activityBadgeStyles: Record<ActivityLevel, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  red: 'bg-red-500/10 text-red-500 border-red-500/20',
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient, appointments } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activityFilter, setActivityFilter] = useState<ActivityLevel | 'all'>('all');
  const { toast } = useToast();

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneError, setEditPhoneError] = useState('');
  const [editEmailError, setEditEmailError] = useState('');

  const resetForm = () => { setNewName(''); setNewPhone(''); setNewEmail(''); setPhoneError(''); setEmailError(''); };
  const resetEditForm = () => { setEditName(''); setEditPhone(''); setEditEmail(''); setEditPhoneError(''); setEditEmailError(''); setSelectedClient(null); };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setNewPhone(formatted);
    setPhoneError(formatted && !isValidPhone(formatted) ? validationMessages.phone : '');
  };
  const handleEmailChange = (value: string) => {
    setNewEmail(value);
    setEmailError(value && !isValidEmail(value) ? validationMessages.email : '');
  };
  const handleEditPhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setEditPhone(formatted);
    setEditPhoneError(formatted && !isValidPhone(formatted) ? validationMessages.phone : '');
  };
  const handleEditEmailChange = (value: string) => {
    setEditEmail(value);
    setEditEmailError(value && !isValidEmail(value) ? validationMessages.email : '');
  };

  const handleCreateClient = async () => {
    if (!newName.trim()) { toast({ title: 'Erro', description: 'Nome é obrigatório.', variant: 'destructive' }); return; }
    if (!newPhone || !isValidPhone(newPhone)) { toast({ title: 'Erro', description: validationMessages.phone, variant: 'destructive' }); return; }
    if (newEmail && !isValidEmail(newEmail)) { toast({ title: 'Erro', description: validationMessages.email, variant: 'destructive' }); return; }

    await addClient({ name: newName.trim(), phone: newPhone, email: newEmail.trim() || undefined });
    setIsDialogOpen(false);
    resetForm();
    toast({ title: 'Cliente cadastrado', description: `${newName} foi adicionado com sucesso.` });
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

  const handleUpdateClient = async () => {
    if (!selectedClient) return;
    if (!editName.trim()) { toast({ title: 'Erro', description: 'Nome é obrigatório.', variant: 'destructive' }); return; }
    if (!editPhone || !isValidPhone(editPhone)) { toast({ title: 'Erro', description: validationMessages.phone, variant: 'destructive' }); return; }
    if (editEmail && !isValidEmail(editEmail)) { toast({ title: 'Erro', description: validationMessages.email, variant: 'destructive' }); return; }

    await updateClient(selectedClient.id, { name: editName.trim(), phone: editPhone, email: editEmail.trim() || undefined });
    setIsEditDialogOpen(false);
    resetEditForm();
    toast({ title: 'Cliente atualizado', description: `${editName} foi atualizado com sucesso.` });
  };

  const handleOpenDeleteDialog = (client: Client) => { setSelectedClient(client); setIsDeleteDialogOpen(true); };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    await deleteClient(selectedClient.id);
    setIsDeleteDialogOpen(false);
    toast({ title: 'Cliente excluído', description: `${selectedClient.name} foi removido com sucesso.` });
    setSelectedClient(null);
  };

  const getClientStats = (clientId: string) => {
    const clientAppointments = appointments.filter(apt => apt.clientId === clientId);
    const totalSpent = clientAppointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + apt.services.reduce((s, svc) => s + svc.price, 0), 0);
    return { totalAppointments: clientAppointments.length, totalSpent };
  };

  const clientsWithActivity = useMemo(() => {
    return clients.map(client => ({
      ...client,
      activity: getClientActivity(client.id, appointments),
    }));
  }, [clients, appointments]);

  const activitySummary = useMemo(() => {
    const summary = { total: clientsWithActivity.length, active: 0, yellow: 0, orange: 0, red: 0 };
    clientsWithActivity.forEach(c => {
      if (c.activity.level === 'active' || c.activity.level === 'new') summary.active++;
      else if (c.activity.level === 'yellow') summary.yellow++;
      else if (c.activity.level === 'orange') summary.orange++;
      else if (c.activity.level === 'red') summary.red++;
    });
    return summary;
  }, [clientsWithActivity]);

  const filteredClients = useMemo(() => {
    return clientsWithActivity.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.phone.includes(searchTerm);
      const matchesActivity = activityFilter === 'all' || client.activity.level === activityFilter ||
        (activityFilter === 'active' && client.activity.level === 'new');
      return matchesSearch && matchesActivity;
    });
  }, [clientsWithActivity, searchTerm, activityFilter]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Clientes
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Gerencie o cadastro de clientes da barbearia
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="gold" size="default" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome *</label>
                  <Input placeholder="Nome completo" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone *</label>
                  <Input placeholder="(99) 99999-9999" value={newPhone} onChange={(e) => handlePhoneChange(e.target.value)} maxLength={15} />
                  {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="email@exemplo.com" value={newEmail} onChange={(e) => handleEmailChange(e.target.value)} />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>
                <Button variant="gold" className="w-full" onClick={handleCreateClient}>Cadastrar Cliente</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Client Summary */}
        <Card className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <button onClick={() => setActivityFilter('all')} className={`p-2 rounded-lg transition-colors ${activityFilter === 'all' ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <p className="text-xl font-heading font-bold text-gradient-gold">{activitySummary.total}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Total</p>
            </button>
            <button onClick={() => setActivityFilter('active')} className={`p-2 rounded-lg transition-colors ${activityFilter === 'active' ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <p className="text-xl font-heading font-bold text-green-500">{activitySummary.active}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </button>
            <button onClick={() => setActivityFilter('yellow')} className={`p-2 rounded-lg transition-colors ${activityFilter === 'yellow' ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <p className="text-xl font-heading font-bold text-yellow-500">{activitySummary.yellow}</p>
              <p className="text-xs text-muted-foreground">Atenção</p>
            </button>
            <button onClick={() => setActivityFilter('orange')} className={`p-2 rounded-lg transition-colors ${activityFilter === 'orange' ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <p className="text-xl font-heading font-bold text-orange-500">{activitySummary.orange}</p>
              <p className="text-xs text-muted-foreground">Alerta</p>
            </button>
            <button onClick={() => setActivityFilter('red')} className={`p-2 rounded-lg transition-colors ${activityFilter === 'red' ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <p className="text-xl font-heading font-bold text-red-500">{activitySummary.red}</p>
              <p className="text-xs text-muted-foreground">Crítico</p>
            </button>
          </div>
        </Card>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClients.map((client) => {
            const stats = getClientStats(client.id);
            const activity = client.activity;
            return (
              <Card key={client.id} variant="elevated" className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-gold flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-base md:text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base md:text-lg truncate">
                          {client.name}
                        </CardTitle>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${activityBadgeStyles[activity.level]}`}>
                          {activity.level === 'red' && <AlertTriangle className="w-3 h-3" />}
                          {activity.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Cliente desde {client.createdAt.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditDialog(client)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(client)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      {client.phone}
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-border grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-heading font-bold text-foreground">{stats.totalAppointments}</p>
                      <p className="text-xs text-muted-foreground">Atendimentos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-heading font-bold text-gradient-gold">R$ {stats.totalSpent.toFixed(0)}</p>
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
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          </Card>
        )}

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) resetEditForm(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Editar Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input placeholder="Nome completo" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone *</label>
                <Input placeholder="(99) 99999-9999" value={editPhone} onChange={(e) => handleEditPhoneChange(e.target.value)} maxLength={15} />
                {editPhoneError && <p className="text-xs text-destructive">{editPhoneError}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="email@exemplo.com" value={editEmail} onChange={(e) => handleEditEmailChange(e.target.value)} />
                {editEmailError && <p className="text-xs text-destructive">{editEmailError}</p>}
              </div>
              <Button variant="gold" className="w-full" onClick={handleUpdateClient}>Salvar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>

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
