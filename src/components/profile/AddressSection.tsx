import React, { useState, useEffect } from 'react';
import { Address } from '@/types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Plus, Pencil, Trash2, Star, StarOff, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddressSectionProps {
  addresses: Address[];
  onAddAddress: (address: Omit<Address, 'id'>) => void;
  onUpdateAddress: (address: Address) => void;
  onDeleteAddress: (id: string) => void;
  onSetMainAddress: (id: string) => void;
}

const ZONAS = [
  'Zona Norte',
  'Zona Sul',
  'Zona Leste',
  'Zona Oeste',
  'Centro'
];

export const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetMainAddress
}) => {
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    isMain: false,
    region: ''
  });
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const cep = newAddress.zipCode.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsLoadingCep(true);
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setNewAddress(prev => ({
              ...prev,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf
            }));
            toast({
              title: "Endereço encontrado",
              description: "Preencha os campos restantes."
            });
          } else {
            toast({
              title: "CEP não encontrado",
              description: "Verifique o CEP e tente novamente.",
              variant: "destructive"
            });
          }
        })
        .catch(() => {
          toast({
            title: "Erro ao buscar CEP",
            description: "Tente novamente mais tarde.",
            variant: "destructive"
          });
        })
        .finally(() => setIsLoadingCep(false));
    }
  }, [newAddress.zipCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação dos campos obrigatórios
    const errors: Record<string, string> = {};
    if (!newAddress.street) errors.street = 'Endereço é obrigatório';
    if (!newAddress.number) errors.number = 'Número é obrigatório';
    if (!newAddress.neighborhood) errors.neighborhood = 'Bairro é obrigatório';
    if (!newAddress.city) errors.city = 'Cidade é obrigatória';
    if (!newAddress.state) errors.state = 'Estado é obrigatório';
    if (!newAddress.zipCode) errors.zipCode = 'CEP é obrigatório';

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (editingAddress) {
      onUpdateAddress({ ...editingAddress, ...newAddress });
      toast({
        title: "Endereço atualizado",
        description: "O endereço foi atualizado com sucesso."
      });
    } else {
      onAddAddress(newAddress);
      toast({
        title: "Endereço adicionado",
        description: "O novo endereço foi adicionado com sucesso."
      });
    }
    setIsAddingAddress(false);
    setEditingAddress(null);
    setNewAddress({
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      isMain: false,
      region: ''
    });
    setAddressErrors({});
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setNewAddress(address);
    setIsAddingAddress(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este endereço?')) {
      onDeleteAddress(id);
      toast({
        title: "Endereço excluído",
        description: "O endereço foi excluído com sucesso."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Endereço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Editar Endereço' : 'Adicionar Novo Endereço'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={newAddress.zipCode}
                    onChange={(e) => {
                      const valor = e.target.value;
                      const cepLimpo = valor.replace(/\D/g, '');
                      let cepFormatado = cepLimpo;
                      if (cepLimpo.length > 5) {
                        cepFormatado = `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5, 8)}`;
                      }
                      setNewAddress(prev => ({ ...prev, zipCode: cepFormatado }));
                    }}
                    maxLength={9}
                    placeholder="00000-000"
                    className={addressErrors.zipCode ? 'border-red-500' : ''}
                    disabled={isLoadingCep}
                  />
                  {isLoadingCep && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                      Buscando CEP...
                    </p>
                  )}
                  {addressErrors.zipCode && !isLoadingCep && (
                    <p className="text-sm text-red-500 mt-1">{addressErrors.zipCode}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="street">Endereço (Rua/Av.) *</Label>
                  <Input
                    id="street"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                    className={addressErrors.street ? 'border-red-500' : ''}
                    disabled={isLoadingCep}
                  />
                  {addressErrors.street && (
                    <p className="text-sm text-red-500 mt-1">{addressErrors.street}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={newAddress.number}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, number: e.target.value }))}
                    className={addressErrors.number ? 'border-red-500' : ''}
                  />
                  {addressErrors.number && (
                    <p className="text-sm text-red-500 mt-1">{addressErrors.number}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={newAddress.complement || ''}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, complement: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={newAddress.neighborhood}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                    className={addressErrors.neighborhood ? 'border-red-500' : ''}
                    disabled={isLoadingCep}
                  />
                  {addressErrors.neighborhood && (
                    <p className="text-sm text-red-500 mt-1">{addressErrors.neighborhood}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    className={addressErrors.city ? 'border-red-500' : ''}
                    disabled={isLoadingCep}
                  />
                  {addressErrors.city && (
                    <p className="text-sm text-red-500 mt-1">{addressErrors.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    className={addressErrors.state ? 'border-red-500' : ''}
                    disabled={isLoadingCep}
                  />
                  {addressErrors.state && (
                    <p className="text-sm text-red-500 mt-1">{addressErrors.state}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingAddress(false);
                    setEditingAddress(null);
                    setAddressErrors({});
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#8DC63F] hover:bg-[#8DC63F]/90 text-white"
                >
                  {editingAddress ? 'Salvar Alterações' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {addresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.neighborhood} - {address.city}/{address.state}
                    </p>
                    <p className="text-sm text-muted-foreground">CEP: {address.zipCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSetMainAddress(address.id)}
                    title={address.isMain ? 'Endereço Principal' : 'Definir como Principal'}
                  >
                    {address.isMain ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(address)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(address.id)}
                    disabled={address.isMain}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 