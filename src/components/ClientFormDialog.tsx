import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppData, Client } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { formatPhone, isValidPhone, isValidEmail, validationMessages } from '@/lib/validation';

interface ClientFormDialogProps {
  trigger?: React.ReactNode;
  onClientCreated?: (client: Client) => void;
}

export function ClientFormDialog({ trigger, onClientCreated }: ClientFormDialogProps) {
  const { addClient } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPhoneError('');
    setEmailError('');
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
    if (formatted && !isValidPhone(formatted)) {
      setPhoneError(validationMessages.phone);
    } else {
      setPhoneError('');
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError(validationMessages.email);
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!phone || !isValidPhone(phone)) {
      toast({
        title: 'Erro',
        description: validationMessages.phone,
        variant: 'destructive',
      });
      return;
    }

    if (email && !isValidEmail(email)) {
      toast({
        title: 'Erro',
        description: validationMessages.email,
        variant: 'destructive',
      });
      return;
    }

    const newClient = await addClient({
      name: name.trim(),
      phone,
      email: email.trim() || undefined,
    });

    if (newClient) {
      toast({
        title: 'Cliente cadastrado',
        description: `${newClient.name} foi adicionado com sucesso.`,
      });

      onClientCreated?.(newClient);
      setIsOpen(false);
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="gold" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Novo Cliente
          </Button>
        )}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Telefone *</label>
            <Input
              placeholder="(99) 99999-9999"
              value={phone}
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
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>
          <Button variant="gold" className="w-full" onClick={handleSubmit}>
            Cadastrar Cliente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
