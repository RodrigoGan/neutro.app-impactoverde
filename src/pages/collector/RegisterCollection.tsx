import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, MapPin, Calendar, Clock, ChevronLeft, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { materialDisplayData } from '@/config/materialDisplayData';

interface Material {
  tipo: string;
  quantidade: string;
  unidade: string;
  descricao?: string;
}

interface FormData {
  nomeCliente?: string;
  endereco: string;
  data: string;
  hora: string;
}

const RegisterCollection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userType = location.state?.userType || 'individual_collector';
  const user = location.state?.user;
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [novoMaterial, setNovoMaterial] = useState<Material>({
    tipo: '',
    quantidade: '',
    unidade: 'kg'
  });
  const [formData, setFormData] = useState<FormData>({
    nomeCliente: '',
    endereco: '',
    data: '',
    hora: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [fotos, setFotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [erroMateriais, setErroMateriais] = useState(false);
  const [dataColeta, setDataColeta] = useState<Date | undefined>(undefined);
  const [horaColeta, setHoraColeta] = useState<string>('');
  const [isDataPopoverOpen, setIsDataPopoverOpen] = useState(false);
  const HORARIOS_DISPONIVEIS = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  const [showAnimation, setShowAnimation] = useState(false);
  const [descricaoOutros, setDescricaoOutros] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAdicionarMaterial = () => {
    if (!novoMaterial.tipo || !novoMaterial.quantidade || !novoMaterial.unidade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do material",
        variant: "destructive"
      });
      return;
    }
    if (novoMaterial.tipo === 'outros' && !descricaoOutros.trim()) {
      toast({
        title: "Erro",
        description: "Descreva o material em 'Outros'",
        variant: "destructive"
      });
      return;
    }
    setMateriais([...materiais, { ...novoMaterial, descricao: novoMaterial.tipo === 'outros' ? descricaoOutros : undefined }]);
    setNovoMaterial({ tipo: '', quantidade: '', unidade: 'kg' });
    setDescricaoOutros('');
    toast({
      title: "Sucesso",
      description: "Material adicionado com sucesso"
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpa o erro do campo quando ele é alterado
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let erroMaterial = false;
    
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.data);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.data = 'A data não pode ser futura';
      }
    }

    if (!formData.hora) {
      newErrors.hora = 'Hora é obrigatória';
    }

    // Validação de pelo menos um material
    if (materiais.length === 0) {
      erroMaterial = true;
      toast({
        title: "Erro ao registrar coleta",
        description: "Adicione pelo menos um material para registrar a coleta.",
        variant: "destructive"
      });
    }

    setErroMateriais(erroMaterial);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !erroMaterial;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Resetar campos do formulário
      setMateriais([]);
      setNovoMaterial({ tipo: '', quantidade: '', unidade: 'kg' });
      setFormData({ nomeCliente: '', endereco: '', data: '', hora: '' });
      setFotos([]);
      setErroMateriais(false);
      setErrors({});
      setDataColeta(undefined);
      setHoraColeta('');

      // Exibir animação de sucesso
      setShowAnimation(true);
    } else {
      toast({
        title: "Erro ao registrar coleta",
        description: "Por favor, verifique os campos destacados.",
        variant: "destructive"
      });
    }
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFotos: string[] = [];
    for (let i = 0; i < files.length && fotos.length + newFotos.length < 3; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotos(prev => [...prev, reader.result as string].slice(0, 3));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverFoto = (idx: number) => {
    setFotos(prev => prev.filter((_, i) => i !== idx));
  };

  // Adaptação de textos
  const titulo = userType === 'cooperative_owner' ? 'Registrar Coleta da Cooperativa' : 'Registrar Nova Coleta';
  const aviso = userType === 'cooperative_owner'
    ? 'Coletas manuais da cooperativa não somam pontos para o nível dos cooperados.'
    : 'Coletas manuais não somam pontos para o seu nível, pois não são validadas por terceiros.';

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/standard', { state: { userId: location.state?.userId } })}
          className="flex items-center gap-2 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded flex items-center gap-3">
          <Package className="h-6 w-6 text-yellow-500" />
          <span className="text-yellow-900 text-sm">
            {aviso}
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-neutro" />
              {titulo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do Cliente (opcional) */}
              <div className="space-y-2">
                <Label>Nome do Cliente <span className="text-xs text-muted-foreground">(opcional)</span></Label>
                <Input
                  placeholder="Nome do cliente, empresa ou responsável (opcional)"
                  name="nomeCliente"
                  value={formData.nomeCliente}
                  onChange={handleInputChange}
                />
              </div>
              {/* Local da Coleta */}
              <div className="space-y-2">
                <Label>Local da Coleta</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Endereço da coleta"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    className={errors.endereco ? 'border-red-500' : ''}
                  />
                </div>
                {errors.endereco && (
                  <p className="text-sm text-red-500">{errors.endereco}</p>
                )}
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Popover open={isDataPopoverOpen} onOpenChange={setIsDataPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataColeta && "text-muted-foreground",
                          errors.data && "border-red-500"
                        )}
                        onClick={() => setIsDataPopoverOpen(true)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dataColeta ? format(dataColeta, "dd 'de' MMMM yyyy", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dataColeta}
                        onSelect={date => {
                          setDataColeta(date);
                          setFormData(prev => ({ ...prev, data: date ? format(date, 'yyyy-MM-dd') : '' }));
                          setIsDataPopoverOpen(false);
                        }}
                        locale={ptBR}
                        disabled={date => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.data && (
                    <p className="text-sm text-red-500">{errors.data}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Horário</Label>
                  <Select
                    value={horaColeta}
                    onValueChange={value => {
                      setHoraColeta(value);
                      setFormData(prev => ({ ...prev, hora: value }));
                    }}
                  >
                    <SelectTrigger className={errors.hora ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {HORARIOS_DISPONIVEIS.map(hora => (
                        <SelectItem key={hora} value={hora}>{hora}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.hora && (
                    <p className="text-sm text-red-500">{errors.hora}</p>
                  )}
                </div>
              </div>

              {/* Materiais */}
              <div className={cn("space-y-4", erroMateriais && "border border-red-500 rounded p-2")}>
                <Label>Materiais Coletados</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    value={novoMaterial.tipo}
                    onValueChange={(value) => setNovoMaterial({ ...novoMaterial, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de material" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(materialDisplayData).map(([identificador, material]) => (
                        <SelectItem key={identificador} value={identificador}>
                          <div className="flex items-center gap-2">
                            <material.icone className={`h-4 w-4 ${material.cor}`} />
                            <span>{material.nome}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Quantidade"
                    value={novoMaterial.quantidade}
                    onChange={(e) => setNovoMaterial({ ...novoMaterial, quantidade: e.target.value })}
                  />
                  <Select
                    value={novoMaterial.unidade}
                    onValueChange={(value) => setNovoMaterial({ ...novoMaterial, unidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      <SelectItem value="un">Unidades</SelectItem>
                      <SelectItem value="saco">Sacos</SelectItem>
                      <SelectItem value="caixa">Caixas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {novoMaterial.tipo === 'outros' && (
                  <Input
                    className="mt-2"
                    placeholder="Descreva o material..."
                    value={descricaoOutros}
                    onChange={e => setDescricaoOutros(e.target.value)}
                    maxLength={60}
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAdicionarMaterial}
                  className="w-full"
                >
                  Adicionar Material
                </Button>

                {/* Lista de Materiais Adicionados */}
                {materiais.length > 0 && (
                  <div className="space-y-2">
                    {materiais.map((material, index) => {
                      const displayInfo = materialDisplayData[material.tipo] || materialDisplayData.outros;
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <displayInfo.icone className={`h-4 w-4 ${displayInfo.cor}`} />
                            <span>{displayInfo.nome}</span>
                            {material.tipo === 'outros' && material.descricao && (
                              <span className="ml-2 italic text-xs text-muted-foreground">({material.descricao})</span>
                            )}
                          </div>
                          <span>
                            {material.quantidade} {material.unidade}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Mensagem de erro visual */}
                {erroMateriais && (
                  <p className="text-sm text-red-500 mt-1">Adicione pelo menos um material para registrar a coleta.</p>
                )}
              </div>

              {/* Fotos dos Materiais */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  Fotos dos Materiais <span className="text-xs text-muted-foreground">(opcional, máx. 3)</span>
                </Label>
                <div className="flex gap-2 items-center">
                  {fotos.map((foto, idx) => (
                    <div key={idx} className="relative group">
                      <img src={foto} alt={`Foto ${idx + 1}`} className="w-20 h-20 object-cover rounded border" />
                      <button type="button" onClick={() => handleRemoverFoto(idx)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100">
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                  {fotos.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 border-2 border-dashed border-muted-foreground flex flex-col items-center justify-center rounded text-muted-foreground hover:bg-muted/50"
                    >
                      <span className="text-2xl">+</span>
                      <span className="text-xs">Adicionar</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFotoChange}
                        className="hidden"
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Adicione observações sobre a coleta..." />
              </div>

              {/* Botão de Submit */}
              <Button type="submit" className="w-full">
                Registrar Coleta
              </Button>
            </form>
          </CardContent>
        </Card>

        {showAnimation && (
          <AchievementAnimation
            title="Coleta Registrada!"
            description="Sua coleta manual foi registrada com sucesso."
            icon={<Package className="w-16 h-16 text-green-600" />}
            soundType="achievement"
            onComplete={() => {
              setShowAnimation(false);
              navigate('/dashboard/standard', { state: { userId: location.state?.userId } });
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default RegisterCollection; 