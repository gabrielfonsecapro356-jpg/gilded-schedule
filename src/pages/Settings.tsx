import { useState } from 'react';
import { Save, Building, Clock, Bell, Link2, Key } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  
  const [shopName, setShopName] = useState('BarberPro');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('20:00');
  const [appointmentDuration, setAppointmentDuration] = useState('90');
  const [notifications, setNotifications] = useState(true);
  const [googleCalendarSync, setGoogleCalendarSync] = useState(false);
  const [n8nWebhook, setN8nWebhook] = useState('');

  const handleSave = () => {
    toast({
      title: 'Configurações salvas',
      description: 'Suas alterações foram salvas com sucesso.',
    });
  };

  return (
    <Layout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">
            Personalize as configurações do sistema
          </p>
        </div>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Informações do Negócio</CardTitle>
                <CardDescription>Configure os dados da barbearia</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Barbearia</label>
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Horários</CardTitle>
                <CardDescription>Configure os horários de funcionamento</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário de Abertura</label>
                <Input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário de Fechamento</label>
                <Input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duração do Atendimento (min)</label>
                <Input
                  type="number"
                  value={appointmentDuration}
                  onChange={(e) => setAppointmentDuration(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure as notificações do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações de Agendamento</p>
                <p className="text-sm text-muted-foreground">
                  Receba notificações quando um novo agendamento for criado
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>Configure integrações com serviços externos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Calendar */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H18V18zm0-6h-4.5v-4.5H18V12z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Google Calendar</p>
                  <p className="text-sm text-muted-foreground">
                    Sincronize agendamentos com o Google Calendar
                  </p>
                </div>
              </div>
              <Switch
                checked={googleCalendarSync}
                onCheckedChange={setGoogleCalendarSync}
              />
            </div>

            {/* n8n Webhook */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">n8n Webhook</p>
                  <p className="text-sm text-muted-foreground">
                    Configure o webhook para automação com n8n
                  </p>
                </div>
              </div>
              <Input
                placeholder="https://seu-n8n.com/webhook/..."
                value={n8nWebhook}
                onChange={(e) => setN8nWebhook(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                O sistema enviará eventos de agendamento para este webhook, 
                permitindo automação com agentes de IA.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="gold" size="lg" onClick={handleSave}>
            <Save className="w-5 h-5 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </Layout>
  );
}
