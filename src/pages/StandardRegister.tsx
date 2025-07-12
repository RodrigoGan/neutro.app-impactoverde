import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Utensils, 
  ShoppingBag, 
  GraduationCap 
} from 'lucide-react';

// Componentes reutilizáveis
import MaterialSelector from '@/components/forms/MaterialSelector';
import VehicleSelector from '@/components/forms/VehicleSelector';
import NeighborhoodSelector from '@/components/forms/NeighborhoodSelector';
import UnitSelector from '@/components/forms/UnitSelector';

type UserType = 'common' | 'collector' | 'cooperative' | 'company' | 'partner';
type PartnerType = 'restaurant' | 'store' | 'educational';

const StandardRegister: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useParams<{ userType: UserType }>();
  const [partnerType, setPartnerType] = useState<PartnerType | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Estados do formulário
  const [formData, setFormData] = useState({
    // Campos comuns
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cpf: '',
    cnpj: '',
    
    // Endereço
    address: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    },

    // Campos específicos por tipo
    selectedMaterials: [] as string[],
    selectedVehicle: '',
    otherVehicleDescription: '',
    selectedNeighborhoods: [] as string[],
    processingCapacity: '',
    numberOfMembers: '',
    businessInfo: {
      cuisine: '',
      capacity: '',
      openingHours: '',
      businessType: '',
      size: '',
      institutionType: '',
      numberOfStudents: '',
      educationalLevel: [] as string[]
    }
  });

  // Renderização do formulário baseado no tipo de usuário
  const renderUserTypeForm = () => {
    switch (userType) {
      case 'common':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>CPF *</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div>
                <Label>Materiais de Preferência</Label>
                <MaterialSelector
                  selectedMaterials={formData.selectedMaterials}
                  onChange={(materials) => setFormData({ ...formData, selectedMaterials: materials })}
                />
              </div>
            </div>
          </div>
        );

      case 'collector':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>CPF *</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo de Veículo *</Label>
                <VehicleSelector
                  selectedVehicle={formData.selectedVehicle}
                  onChange={(vehicle) => setFormData({ ...formData, selectedVehicle: vehicle })}
                  otherVehicleDescription={formData.otherVehicleDescription}
                  onOtherDescriptionChange={(desc) => setFormData({ ...formData, otherVehicleDescription: desc })}
                />
              </div>
              <div>
                <Label>Materiais que Coleta *</Label>
                <MaterialSelector
                  selectedMaterials={formData.selectedMaterials}
                  onChange={(materials) => setFormData({ ...formData, selectedMaterials: materials })}
                />
              </div>
              <div>
                <Label>Bairros de Atuação *</Label>
                <NeighborhoodSelector
                  selectedNeighborhoods={formData.selectedNeighborhoods}
                  onChange={(neighborhoods) => setFormData({ ...formData, selectedNeighborhoods: neighborhoods })}
                />
              </div>
            </div>
          </div>
        );

      case 'cooperative':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Nome da Cooperativa *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>CNPJ *</Label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div>
                <Label>Número de Cooperados *</Label>
                <Input
                  type="number"
                  value={formData.numberOfMembers}
                  onChange={(e) => setFormData({ ...formData, numberOfMembers: e.target.value })}
                />
              </div>
              <div>
                <Label>Materiais que Processa *</Label>
                <MaterialSelector
                  selectedMaterials={formData.selectedMaterials}
                  onChange={(materials) => setFormData({ ...formData, selectedMaterials: materials })}
                />
              </div>
              <div>
                <Label>Bairros de Atuação *</Label>
                <NeighborhoodSelector
                  selectedNeighborhoods={formData.selectedNeighborhoods}
                  onChange={(neighborhoods) => setFormData({ ...formData, selectedNeighborhoods: neighborhoods })}
                />
              </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Nome da Empresa *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>CNPJ *</Label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div>
                <Label>Capacidade de Processamento (ton/mês) *</Label>
                <Input
                  type="number"
                  value={formData.processingCapacity}
                  onChange={(e) => setFormData({ ...formData, processingCapacity: e.target.value })}
                />
              </div>
              <div>
                <Label>Materiais que Compra *</Label>
                <MaterialSelector
                  selectedMaterials={formData.selectedMaterials}
                  onChange={(materials) => setFormData({ ...formData, selectedMaterials: materials })}
                />
              </div>
              <div>
                <Label>Bairros de Atuação *</Label>
                <NeighborhoodSelector
                  selectedNeighborhoods={formData.selectedNeighborhoods}
                  onChange={(neighborhoods) => setFormData({ ...formData, selectedNeighborhoods: neighborhoods })}
                />
              </div>
            </div>
          </div>
        );

      case 'partner':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Tipo de Parceiro *</Label>
                <Select
                  value={partnerType || ''}
                  onValueChange={(value) => setPartnerType(value as PartnerType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        <span>Restaurante</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="store">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        <span>Loja</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="educational">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>Instituição Educacional</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {partnerType && (
                <>
                  <div>
                    <Label>Nome do Estabelecimento *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>CNPJ *</Label>
                    <Input
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    />
                  </div>

                  {partnerType === 'restaurant' && (
                    <>
                      <div>
                        <Label>Tipo de Cozinha *</Label>
                        <Input
                          value={formData.businessInfo.cuisine}
                          onChange={(e) => setFormData({
                            ...formData,
                            businessInfo: { ...formData.businessInfo, cuisine: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Capacidade de Atendimento *</Label>
                        <Input
                          type="number"
                          value={formData.businessInfo.capacity}
                          onChange={(e) => setFormData({
                            ...formData,
                            businessInfo: { ...formData.businessInfo, capacity: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}

                  {partnerType === 'store' && (
                    <>
                      <div>
                        <Label>Tipo de Negócio *</Label>
                        <Input
                          value={formData.businessInfo.businessType}
                          onChange={(e) => setFormData({
                            ...formData,
                            businessInfo: { ...formData.businessInfo, businessType: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Tamanho do Estabelecimento (m²) *</Label>
                        <Input
                          type="number"
                          value={formData.businessInfo.size}
                          onChange={(e) => setFormData({
                            ...formData,
                            businessInfo: { ...formData.businessInfo, size: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}

                  {partnerType === 'educational' && (
                    <>
                      <div>
                        <Label>Tipo de Instituição *</Label>
                        <Input
                          value={formData.businessInfo.institutionType}
                          onChange={(e) => setFormData({
                            ...formData,
                            businessInfo: { ...formData.businessInfo, institutionType: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label>Número de Alunos *</Label>
                        <Input
                          type="number"
                          value={formData.businessInfo.numberOfStudents}
                          onChange={(e) => setFormData({
                            ...formData,
                            businessInfo: { ...formData.businessInfo, numberOfStudents: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Se não houver tipo de usuário, redireciona para a página de seleção
  if (!userType) {
    navigate('/register');
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>
            {userType === 'common' && 'Registro de Usuário Comum'}
            {userType === 'collector' && 'Registro de Coletor Individual'}
            {userType === 'cooperative' && 'Registro de Cooperativa'}
            {userType === 'company' && 'Registro de Empresa Coletora'}
            {userType === 'partner' && 'Registro de Empresa Parceira'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Tabs value={currentStep.toString()}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="1">Dados Básicos</TabsTrigger>
                <TabsTrigger value="2">Endereço</TabsTrigger>
                <TabsTrigger value="3">Dados Específicos</TabsTrigger>
              </TabsList>

              <TabsContent value="1">
                <div className="space-y-4">
                  <div>
                    <Label>E-mail *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Senha *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Confirmar Senha *</Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Telefone *</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="2">
                <div className="space-y-4">
                  <div>
                    <Label>CEP *</Label>
                    <Input
                      value={formData.address.cep}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, cep: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Logradouro *</Label>
                    <Input
                      value={formData.address.logradouro}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, logradouro: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Número *</Label>
                    <Input
                      value={formData.address.numero}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, numero: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                    <Input
                      value={formData.address.complemento}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, complemento: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Bairro *</Label>
                    <Input
                      value={formData.address.bairro}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, bairro: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Cidade *</Label>
                    <Input
                      value={formData.address.cidade}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, cidade: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Estado *</Label>
                    <Input
                      value={formData.address.estado}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, estado: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="3">
                {renderUserTypeForm()}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep > 1 ? currentStep - 1 : 1)}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              <Button
                onClick={() => {
                  if (currentStep < 3) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    // Lógica de submissão do formulário
                    console.log('Formulário enviado:', formData);
                  }
                }}
              >
                {currentStep === 3 ? 'Finalizar' : 'Próximo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StandardRegister; 