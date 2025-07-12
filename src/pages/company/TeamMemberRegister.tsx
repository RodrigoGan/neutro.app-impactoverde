import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, Users } from 'lucide-react';

const FUNCTION_OPTIONS = [
  'Gerente',
  'Motorista',
  'Administrativo',
  'Supervisor',
  'Funcionário',
  'Outra'
];

const CARD_PERMISSIONS = [
  { key: 'cupons', label: 'Cupons' },
  { key: 'metas', label: 'Metas e Progresso' },
  { key: 'impacto', label: 'Impacto Ambiental' },
  { key: 'financeiro', label: 'Gestão Financeira' },
  { key: 'notificacoes', label: 'Notificações' },
  { key: 'equipe', label: 'Gestão de Equipe' }
];

const TeamMemberRegister: React.FC = () => {
  const navigate = useNavigate();
  const [functionValue, setFunctionValue] = useState('');
  const [customFunction, setCustomFunction] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [avatar, setAvatar] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    admission: '',
    notes: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handlePermissionChange = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!form.email.trim()) newErrors.email = 'E-mail é obrigatório';
    if (!form.password) newErrors.password = 'Senha é obrigatória';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Confirme a senha';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
    if (!functionValue) newErrors.functionValue = 'Função/Cargo é obrigatória';
    if (functionValue === 'Outra' && !customFunction.trim()) newErrors.customFunction = 'Informe a função';
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    // Aqui você pode implementar o envio dos dados
    // Exemplo: toast.success('Funcionário cadastrado com sucesso!');
  };

  return (
    <div className="container mx-auto px-4 md:px-6 min-h-screen bg-background py-4">
      <Button
        variant="ghost"
        className="flex items-center gap-2 mb-4 pl-0"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar
      </Button>
      <div className="flex justify-center">
        <Card className="w-full max-w-md shadow-lg rounded-xl p-3 sm:p-6">
          <form onSubmit={handleSubmit} noValidate>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-neutro" />
                Cadastro de Funcionário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Nome */}
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" placeholder="Digite o nome" required size={1} className={`text-base py-2 ${errors.name ? 'border-red-500' : ''}`} value={form.name} onChange={handleInputChange} />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>
              {/* Função */}
              <div>
                <Label htmlFor="function">Função/Cargo</Label>
                <select
                  id="function"
                  name="functionValue"
                  className={`border rounded px-2 py-2 w-full mt-1 text-base ${errors.functionValue ? 'border-red-500' : ''}`}
                  value={functionValue}
                  onChange={e => { setFunctionValue(e.target.value); setErrors(prev => ({ ...prev, functionValue: '' })); }}
                >
                  <option value="">Selecione...</option>
                  {FUNCTION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {functionValue === 'Outra' && (
                  <Input
                    className={`mt-2 text-base py-2 ${errors.customFunction ? 'border-red-500' : ''}`}
                    placeholder="Digite a função"
                    value={customFunction}
                    onChange={e => { setCustomFunction(e.target.value); setErrors(prev => ({ ...prev, customFunction: '' })); }}
                  />
                )}
                {errors.functionValue && <p className="text-sm text-red-500 mt-1">{errors.functionValue}</p>}
                {errors.customFunction && <p className="text-sm text-red-500 mt-1">{errors.customFunction}</p>}
              </div>
              {/* Foto/avatar */}
              <div>
                <Label>Foto/Avatar</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Avatar className="h-12 w-12">
                    {avatar ? <AvatarImage src={avatar} /> : <AvatarFallback>?</AvatarFallback>}
                  </Avatar>
                  <Input type="file" accept="image/*" className="w-full" />
                </div>
              </div>
              {/* E-mail (único, obrigatório) */}
              <div>
                <Label htmlFor="email">E-mail (será usado para login e contato)</Label>
                <Input id="email" name="email" type="email" placeholder="nome@email.com" required className={`text-base py-2 ${errors.email ? 'border-red-500' : ''}`} value={form.email} onChange={handleInputChange} />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
              {/* Senha de Acesso */}
              <div className="pt-2">
                <Label className="font-semibold">Senha de Acesso</Label>
                <div className="mt-2 space-y-2">
                  <Input type="password" name="password" placeholder="Senha" required className={`text-base py-2 ${errors.password ? 'border-red-500' : ''}`} value={form.password} onChange={handleInputChange} />
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                  <Input type="password" name="confirmPassword" placeholder="Confirmar senha" required className={`text-base py-2 ${errors.confirmPassword ? 'border-red-500' : ''}`} value={form.confirmPassword} onChange={handleInputChange} />
                  {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="(99) 99999-9999" className="text-base py-2" value={form.phone} onChange={handleInputChange} />
              </div>
              {/* Data de admissão */}
              <div>
                <Label htmlFor="admission">Data de Admissão</Label>
                <Input id="admission" name="admission" type="date" className="text-base py-2" value={form.admission} onChange={handleInputChange} />
              </div>
              {/* Observações */}
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Input id="notes" name="notes" placeholder="Observações (opcional)" className="text-base py-2" value={form.notes} onChange={handleInputChange} />
              </div>
              {/* Permissões de visualização */}
              <div className="pt-2">
                <Label className="font-semibold">Permissões de Visualização</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CARD_PERMISSIONS.map(card => (
                    <label key={card.key} className="flex items-center gap-2 text-sm">
                      <Switch checked={!!permissions[card.key]} onCheckedChange={() => handlePermissionChange(card.key)} />
                      {card.label}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full text-base font-semibold">
                Salvar
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TeamMemberRegister; 