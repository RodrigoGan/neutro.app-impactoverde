import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CommonRegister: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados para informações básicas
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');

  // Estados para foto de perfil
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Estados para endereço
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [referencia, setReferencia] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // Estados para erros
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    document: '',
    image: ''
  });
  const [showGeneralError, setShowGeneralError] = useState(false);

  // Estados para loading
  const [isCepLoading, setIsCepLoading] = useState(false);

  // Função para lidar com upload de imagem
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erro ao carregar imagem',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive'
        });
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      toast({
        title: 'Imagem selecionada',
        description: 'A nova foto de perfil será atualizada no cadastro.'
      });
    }
  };

  // Função para buscar endereço pelo CEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCep(value);
    if (value.length === 8) {
      setIsCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setEstado(data.uf || '');
        }
      } catch (error) {
        // erro silencioso
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  // Função para validar o formulário
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      document: '',
      image: ''
    };

    if (!name) newErrors.name = 'Nome é obrigatório';
    if (!email) newErrors.email = 'Email é obrigatório';
    if (!password) newErrors.password = 'Senha é obrigatória';
    if (password !== confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
    if (!phone) newErrors.phone = 'Telefone é obrigatório';
    if (!document) newErrors.document = 'Documento é obrigatório';
    if (!selectedImage) newErrors.image = 'Foto de perfil é obrigatória';

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setShowGeneralError(true);
      return;
    }

    // Aqui você implementaria a lógica de registro
    console.log('Dados do formulário:', {
      name,
      email,
      phone,
      document,
      cep,
      logradouro,
      numero,
      complemento,
      referencia,
      bairro,
      cidade,
      estado
    });

    // Simulação de sucesso
    toast({
      title: 'Sucesso',
      description: 'Cadastro realizado com sucesso!',
    });

    // Redirecionar para o dashboard
    navigate('/dashboard/standard');
  };

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate('/register')} className="mb-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Cadastro de Usuário Comum</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={previewImage || undefined} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>
              {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
            </div>

            <div className="space-y-4">
              <Label>Nome</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-4">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-4">
              <Label>Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-4">
              <Label>Confirmar Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua senha"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-4">
              <Label>Telefone</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-4">
              <Label>Documento</Label>
              <Input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="CPF"
              />
              {errors.document && <p className="text-red-500 text-sm">{errors.document}</p>}
            </div>

            <div className="space-y-4">
              <Label>CEP</Label>
              <Input
                type="text"
                value={cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={8}
              />
            </div>

            <div className="space-y-4">
              <Label>Logradouro</Label>
              <Input
                type="text"
                value={logradouro}
                onChange={(e) => setLogradouro(e.target.value)}
                placeholder="Rua, Avenida, etc"
              />
            </div>

            <div className="space-y-4">
              <Label>Número</Label>
              <Input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Número"
              />
            </div>

            <div className="space-y-4">
              <Label>Complemento</Label>
              <Input
                type="text"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Complemento"
              />
            </div>

            <div className="space-y-4">
              <Label>Referência</Label>
              <Input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Referência"
              />
            </div>

            <div className="space-y-4">
              <Label>Bairro</Label>
              <Input
                type="text"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Bairro"
              />
            </div>

            <div className="space-y-4">
              <Label>Cidade</Label>
              <Input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-4">
              <Label>Estado</Label>
              <Input
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                placeholder="Estado"
              />
            </div>

            {showGeneralError && (
              <p className="text-red-500 text-sm">Por favor, corrija os erros acima.</p>
            )}

            <Button type="submit" className="w-full">Cadastrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommonRegister; 