import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Gift, Percent, DollarSign, Clock, Info, X, Upload, Ticket } from 'lucide-react';
import { format, isBefore, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { QRCodeCanvas } from 'qrcode.react';
import { v4 as uuidv4 } from 'uuid';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { AchievementAnimation } from '@/components/animations/AchievementAnimation';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

type PartnerType = 'restaurant' | 'store' | 'educational';

const formSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  discountType: z.enum(['percentage', 'fixed']),
  value: z.string().min(1, 'O valor é obrigatório'),
  expiresAt: z.date().refine((date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return false;
    }
    return !isBefore(date, startOfToday());
  }, {
    message: 'A data de validade deve ser uma data futura válida'
  }),
  quantity: z.number().min(1, 'A quantidade deve ser maior que 0'),
  userLimit: z.literal(1),
  description: z.string().optional(),
  rules: z.array(z.string()).optional(),
  cancellationPolicy: z.string().optional(),
  customerService: z.string().optional(),
  restaurantType: z.string().optional(),
  customRestaurantType: z.string().optional(),
  storeCategories: z.array(z.string()).optional(),
  educationalType: z.string().optional(),
  digitalMaterial: z.any().optional(),
  photo_url: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// Ajustar o tipo de pendingFormData para incluir 'id' e photo_url
type PendingFormData = FormData & { id: string; photo_url?: string };

interface CreateCouponFormProps {
  partnerType: PartnerType;
  onSubmit: (data: FormData) => void;
  onAfterQRCode?: () => void;
  isEdit: boolean;
  initialData?: any;
  onCancel?: () => void;
  userId?: string;
}

// Função para extrair as iniciais do nome do cupom
function getInitials(name: string) {
  if (!name) return 'XX';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// Função para gerar código alfanumérico de 6 dígitos
function generateAlphaNumericCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function CreateCouponForm({ partnerType, onSubmit, onAfterQRCode, isEdit, initialData, onCancel, userId }: CreateCouponFormProps & { initialData?: any }) {
  const [rules, setRules] = React.useState<string[]>(initialData?.rules || ['']);
  const [randomCode] = React.useState(() => generateAlphaNumericCode(6));
  const [showCouponCreated, setShowCouponCreated] = React.useState(false);
  const [pendingFormData, setPendingFormData] = React.useState<PendingFormData | null>(null);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      discountType: initialData.discountType || 'percentage',
      value: initialData.value?.toString() || '',
      expiresAt: initialData.expiresAt ? new Date(initialData.expiresAt) : new Date(),
      quantity: initialData.quantity || 1,
      userLimit: 1,
      description: initialData.description || '',
      rules: initialData.rules || [''],
      cancellationPolicy: initialData.cancellationPolicy || '',
      customerService: initialData.customerService || '',
      restaurantType: initialData.restaurantType || '',
      customRestaurantType: initialData.customRestaurantType || '',
      storeCategories: Array.isArray(initialData.storeCategories) ? initialData.storeCategories : (initialData.storeCategories ? [initialData.storeCategories] : []),
      educationalType: initialData.educationalType || '',
      digitalMaterial: initialData.digitalMaterial || null,
      photo_url: initialData.photo_url || '',
    } : {
      name: '',
      discountType: 'percentage',
      value: '',
      expiresAt: new Date(),
      quantity: 1,
      userLimit: 1,
      description: '',
      rules: [''],
      cancellationPolicy: '',
      customerService: '',
    },
  });

  // Sincronizar o estado local 'rules' com o React Hook Form
  React.useEffect(() => {
    form.setValue('rules', rules);
  }, [rules]);

  const handleAddRule = () => {
    setRules([...rules, '']);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, value: string) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  // Código do cupom: iniciais + código aleatório
  const couponName = form.watch('name');
  const couponInitials = getInitials(couponName);
  const couponCode = `${couponInitials}-${randomCode}`;

  // Função para upload da imagem
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const { data, error } = await supabase.storage.from('cupons').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (error) {
      setUploading(false);
      return toast({ title: 'Erro ao fazer upload da imagem', description: error.message, variant: 'destructive' });
    }
    // Gerar URL pública
    const { data: publicUrlData } = supabase.storage.from('cupons').getPublicUrl(fileName);
    setPhotoUrl(publicUrlData.publicUrl);
    setUploading(false);
  };

  const handleFormSubmit = (data: FormData) => {
    const expiresAt = form.getValues('expiresAt');
    
    if (!expiresAt || !(expiresAt instanceof Date) || isNaN(expiresAt.getTime())) {
      toast({
        title: "Erro na data",
        description: "Por favor, selecione uma data de validade válida",
        variant: "destructive",
      });
      return;
    }

    if (isBefore(expiresAt, startOfToday())) {
      toast({
        title: "Data inválida",
        description: "A data de validade deve ser futura",
        variant: "destructive",
      });
      return;
    }

    // Exibe animação antes de submeter
    setPendingFormData({ ...data, rules, expiresAt, id: couponCode, photo_url: photoUrl });
    setShowCouponCreated(true);
  };

  // Após animação, chama o onSubmit
  React.useEffect(() => {
    if (!showCouponCreated && pendingFormData) {
      onSubmit(pendingFormData);
      setPendingFormData(null);
      form.reset();
      navigate('/dashboard/standard', userId ? { state: { userId } } : undefined);
    }
  }, [showCouponCreated]);

  return (
    <>
      {showCouponCreated && (
        <AchievementAnimation
          title="Cupom Criado!"
          description="Seu cupom foi criado com sucesso e já está disponível para os usuários."
          icon={<Ticket className="w-16 h-16 text-neutro" />}
          soundType="achievement"
          onComplete={() => setShowCouponCreated(false)}
        />
      )}
      <form
        onSubmit={e => {
          e.preventDefault();
          form.handleSubmit(handleFormSubmit, (errors) => {
            if (errors.expiresAt) {
              toast({
                title: "Erro na data",
                description: errors.expiresAt.message,
                variant: "destructive",
              });
            }
          })(e);
        }}
        className="space-y-6"
      >
        <input type="hidden" name="debug" value="1" />
        <Card className="shadow-sm">
          <CardHeader />
          <CardContent className="space-y-8">
            {/* Tipo do Cupom */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Tipo de Cupom</h2>
              <div className="grid gap-2">
                <Label htmlFor="restaurantType">Categoria do Desconto</Label>
                {partnerType === 'restaurant' && (
                  <Select
                    value={form.watch('restaurantType')}
                    onValueChange={(value) => {
                      form.setValue('restaurantType', value);
                      if (value !== 'outros') {
                        form.setValue('customRestaurantType', '');
                      }
                    }}
                    disabled={isEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria do desconto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buffet">Buffet</SelectItem>
                      <SelectItem value="marmitex">Marmitex</SelectItem>
                      <SelectItem value="ala_carte">À la carte</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {partnerType === 'store' && (
                  <Select
                    value={form.watch('storeCategories')?.[0]}
                    onValueChange={(value) => {
                      form.setValue('storeCategories', [value]);
                    }}
                    disabled={isEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria do desconto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sustentavel">Produtos Sustentáveis</SelectItem>
                      <SelectItem value="reciclado">Material Reciclado</SelectItem>
                      <SelectItem value="organico">Produtos Orgânicos</SelectItem>
                      <SelectItem value="eco">Linha Eco</SelectItem>
                      <SelectItem value="outros">Outros Produtos</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {partnerType === 'educational' && (
                  <Select
                    value={form.watch('educationalType')}
                    onValueChange={(value) => form.setValue('educationalType', value)}
                    disabled={isEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria do desconto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ebook">E-books</SelectItem>
                      <SelectItem value="curso">Cursos</SelectItem>
                      <SelectItem value="palestra">Palestras</SelectItem>
                      <SelectItem value="workshop">Workshops</SelectItem>
                      <SelectItem value="material">Materiais Didáticos</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {((partnerType === 'restaurant' && form.watch('restaurantType') === 'outros') ||
                  (partnerType === 'store' && form.watch('storeCategories')?.[0] === 'outros') ||
                  (partnerType === 'educational' && form.watch('educationalType') === 'outros')) && (
                  <div className="mt-2">
                    <Input
                      placeholder="Especifique a categoria do desconto"
                      {...form.register('customRestaurantType')}
                      disabled={isEdit}
                    />
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-4" />
            {/* Informações Básicas */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Informações Básicas</h2>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Cupom</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Desconto em Buffet"
                    {...form.register('name')}
                    readOnly={isEdit}
                    className={isEdit ? 'bg-gray-100' : ''}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Tipo de Desconto</Label>
                  <Select
                    value={form.watch('discountType')}
                    onValueChange={(value: 'percentage' | 'fixed') => form.setValue('discountType', value)}
                    disabled={isEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de desconto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem</SelectItem>
                      <SelectItem value="fixed">Valor Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="value">
                    {form.watch('discountType') === 'percentage' ? 'Porcentagem de Desconto' : 'Valor do Desconto'}
                  </Label>
                  <div className="flex items-center gap-2">
                    {form.watch('discountType') === 'percentage' ? (
                      <div className="relative w-full">
                        <Input
                          id="value"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Ex: 20"
                          {...form.register('value')}
                          readOnly={isEdit}
                          className={isEdit ? 'bg-gray-100' : ''}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
                    ) : (
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          R$
                        </span>
                        <Input
                          id="value"
                          type="number"
                          min="0"
                          className={`pl-8${isEdit ? ' bg-gray-100' : ''}`}
                          placeholder="Ex: 50"
                          {...form.register('value')}
                          readOnly={isEdit}
                        />
                      </div>
                    )}
                  </div>
                  {form.formState.errors.value && (
                    <p className="text-sm text-red-500">{form.formState.errors.value.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o cupom..."
                    {...form.register('description')}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Data de Validade</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch('expiresAt') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('expiresAt') ? format(form.watch('expiresAt'), "PPP", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.watch('expiresAt')}
                        onSelect={(date) => {
                          if (date) {
                            form.setValue('expiresAt', date);
                            form.trigger('expiresAt');
                          }
                        }}
                        disabled={(date) => isBefore(date, startOfToday())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.expiresAt && (
                    <p className="text-sm text-red-500">{form.formState.errors.expiresAt.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantidade Disponível</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    {...form.register('quantity', { valueAsNumber: true })}
                  />
                  {form.formState.errors.quantity && (
                    <p className="text-sm text-red-500">{form.formState.errors.quantity.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="userLimit">Limite por Usuário</Label>
                  <Input
                    id="userLimit"
                    type="number"
                    value={1}
                    className="bg-gray-100"
                    disabled={true}
                  />
                  <p className="text-xs text-muted-foreground">
                    Limite fixo de 1 cupom por usuário para garantir melhor distribuição
                  </p>
                </div>
              </div>
            </div>
            {/* Campo de upload de imagem */}
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span role="img" aria-label="camera">📷</span> Imagem do Cupom <span className="text-sm font-normal text-muted-foreground">(opcional, apenas 1)</span>
              </h2>
              <div className="flex gap-3 flex-wrap items-center mb-2">
                {photoFile && (
                  <div className="relative w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                    <img
                      src={photoUrl || URL.createObjectURL(photoFile)}
                      alt="Foto do Cupom"
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoUrl(null); }}
                      className="absolute top-0 right-0 bg-white/80 hover:bg-white text-red-600 rounded-bl px-1 py-0.5 text-xs"
                      title="Remover foto"
                    >
                      ×
                    </button>
                  </div>
                )}
                {!photoFile && (
                  <label className="w-24 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:border-neutro/60">
                    <span className="text-2xl">+</span>
                    <span className="text-xs">Adicionar</span>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                      disabled={uploading || isEdit}
                    />
                  </label>
                )}
              </div>
              {photoFile && (
                <p className="text-xs text-muted-foreground mt-1">Clique no X para remover.</p>
              )}
            </div>
            <Separator className="my-4" />
            {/* Regras de Uso */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Regras de Uso</h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="rules">Regras de Uso</Label>
                  <div className="space-y-4">
                    {rules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Adicione uma regra"
                          value={rule}
                          onChange={(e) => handleRuleChange(index, e.target.value)}
                          disabled={isEdit}
                        />
                        {isEdit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRule(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddRule}
                      >
                        Adicionar Regra
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            {/* Informações de Contato */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Informações de Contato</h2>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cancellationPolicy">Política de Cancelamento</Label>
                  <Textarea
                    id="cancellationPolicy"
                    placeholder="Descreva a política de cancelamento..."
                    {...form.register('cancellationPolicy')}
                  />
                  {form.formState.errors.cancellationPolicy && (
                    <p className="text-sm text-red-500">{form.formState.errors.cancellationPolicy.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="customerService">SAC</Label>
                  <Input
                    id="customerService"
                    placeholder="Ex: 0800 123 4567"
                    {...form.register('customerService')}
                  />
                  {form.formState.errors.customerService && (
                    <p className="text-sm text-red-500">{form.formState.errors.customerService.message}</p>
                  )}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            {/* Prévia do Cupom */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Prévia do Cupom</h2>
              <div className="bg-gradient-to-br from-neutro/10 to-neutro/30 rounded-lg p-4 border border-neutro/20">
                <div className="flex flex-col gap-2">
                  {/* Imagem do Cupom na prévia */}
                  {photoFile && (
                    <div className="flex justify-center mb-2">
                      <img
                        src={photoUrl || URL.createObjectURL(photoFile)}
                        alt="Foto do Cupom"
                        className="object-cover rounded max-h-32 max-w-xs border"
                        style={{ background: '#fff' }}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {form.watch('name') || 'Nome do Cupom'}
                    </h3>
                    <span className="text-sm font-medium bg-neutro/20 px-2 py-1 rounded">
                      {form.watch('restaurantType') === 'outros'
                        ? form.watch('customRestaurantType')
                        : form.watch('restaurantType')?.replace('_', ' ').toUpperCase() || 'CATEGORIA'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-neutro">
                    {form.watch('discountType') === 'percentage'
                      ? `${form.watch('value') || '0'}%`
                      : `R$ ${form.watch('value') || '0'}`}
                    <span className="text-sm font-normal"> de desconto</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {form.watch('description') || 'Descrição do cupom aparecerá aqui'}
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span>
                      Válido até: {form.watch('expiresAt') ? format(form.watch('expiresAt'), "dd/MM/yyyy") : 'DD/MM/AAAA'}
                    </span>
                    <span>
                      Disponíveis: {form.watch('quantity') || '0'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center mt-4">
                    <QRCodeCanvas value={couponCode} size={128} level="H" includeMargin={true} />
                    <span className="text-xs text-muted-foreground break-all mt-2">Código: {couponCode}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Botão de ação */}
            <div className="pt-6">
              {!isEdit ? (
                <Button type="submit" className="w-full">
                  Criar Cupom
                </Button>
              ) : (
                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={onCancel ? onCancel : () => window.history.back()}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-neutro text-white">
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
} 