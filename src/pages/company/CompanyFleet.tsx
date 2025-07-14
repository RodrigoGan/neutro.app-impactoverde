import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Edit, Eye, Plus, X, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import AppFooter from '@/components/AppFooter';

const statusBadge = {
  'Ativo': 'bg-green-100 text-green-700',
  'Manutenção': 'bg-yellow-100 text-yellow-700',
  'Inativo': 'bg-red-100 text-red-700',
};

const CompanyFleet: React.FC = () => {
  const { user: authUser } = useAuth();
  const companyId = authUser?.entity?.id || 'f1b5c6d7-8d9e-0123-4ef0-567890123456';
  const [tab, setTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [errorVehicles, setErrorVehicles] = useState<string | null>(null);
  const [errorDrivers, setErrorDrivers] = useState<string | null>(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(null);
  const [showDriverDetails, setShowDriverDetails] = useState(null);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [showDriverSuggestions, setShowDriverSuggestions] = useState(false);
  const [showPlateSuggestions, setShowPlateSuggestions] = useState(false);
  const navigate = useNavigate();
  const [uploadingVehiclePhoto, setUploadingVehiclePhoto] = useState(false);
  const [vehiclePhotoError, setVehiclePhotoError] = useState<string | null>(null);
  const [uploadingDriverPhoto, setUploadingDriverPhoto] = useState(false);
  const [driverPhotoError, setDriverPhotoError] = useState<string | null>(null);

  // Funções para veículos
  const handleAddVehicle = () => {
    setEditingVehicle({ id: '', plate: '', model: '', capacity: '', status: 'Ativo', driver: '' });
    setShowVehicleDialog(true);
  };
  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle({ ...vehicle });
    setShowVehicleDialog(true);
  };
  const handleSaveVehicle = () => {
    if (!editingVehicle.plate || !editingVehicle.model) return;
    if (editingVehicle.id) {
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? editingVehicle : v));
      toast.success('Veículo atualizado!');
    } else {
      setVehicles([...vehicles, { ...editingVehicle, id: Date.now().toString() }]);
      toast.success('Veículo adicionado!');
    }
    setShowVehicleDialog(false);
    setEditingVehicle(null);
  };
  const handleToggleVehicle = (vehicle: any) => {
    setVehicles(vehicles.map(v => v.id === vehicle.id ? { ...v, status: v.status === 'Inativo' ? 'Ativo' : 'Inativo' } : v));
    toast.success(vehicle.status === 'Inativo' ? 'Veículo reativado!' : 'Veículo inativado!');
  };

  // Funções para motoristas
  const handleAddDriver = () => {
    setEditingDriver({ id: '', name: '', cnh: '', phone: '', status: 'Ativo', vehicle: '' });
    setShowDriverDialog(true);
  };
  const handleEditDriver = (driver: any) => {
    setEditingDriver({ ...driver });
    setShowDriverDialog(true);
  };
  const handleSaveDriver = () => {
    if (!editingDriver.name || !editingDriver.cnh) return;
    if (editingDriver.id) {
      setDrivers(drivers.map(d => d.id === editingDriver.id ? editingDriver : d));
      toast.success('Motorista atualizado!');
    } else {
      setDrivers([...drivers, { ...editingDriver, id: Date.now().toString() }]);
      toast.success('Motorista adicionado!');
    }
    setShowDriverDialog(false);
    setEditingDriver(null);
  };
  const handleToggleDriver = (driver: any) => {
    setDrivers(drivers.map(d => d.id === driver.id ? { ...d, status: d.status === 'Inativo' ? 'Ativo' : 'Inativo' } : d));
    toast.success(driver.status === 'Inativo' ? 'Motorista reativado!' : 'Motorista inativado!');
  };

  // Função para upload de foto do veículo
  const handleVehiclePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingVehiclePhoto(true);
      setVehiclePhotoError(null);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('vehicles').upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        if (uploadError) {
          setVehiclePhotoError('Erro ao fazer upload da imagem');
          setUploadingVehiclePhoto(false);
          return;
        }
        const { data: publicUrlData } = supabase.storage.from('vehicles').getPublicUrl(fileName);
        setEditingVehicle((prev: any) => ({ ...prev, photo: publicUrlData.publicUrl }));
      } catch (err) {
        setVehiclePhotoError('Erro ao processar a imagem');
      } finally {
        setUploadingVehiclePhoto(false);
      }
    }
  };

  // Função para upload de foto do motorista
  const handleDriverPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingDriverPhoto(true);
      setDriverPhotoError(null);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('drivers').upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('drivers').getPublicUrl(fileName);
        setEditingDriver((prev: any) => ({ ...prev, photo: data.publicUrl }));
      } catch (err: any) {
        setDriverPhotoError(err.message || 'Erro ao fazer upload da foto do motorista');
      } finally {
        setUploadingDriverPhoto(false);
      }
    }
  };

  // Buscar veículos reais do banco
  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    setErrorVehicles(null);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', companyId)
        .order('plate');
      if (error) throw error;
      setVehicles(data || []);
    } catch (err: any) {
      setErrorVehicles('Erro ao buscar veículos.');
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Buscar motoristas reais do banco
  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    setErrorDrivers(null);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', companyId)
        .order('name');
      if (error) throw error;
      setDrivers(data || []);
    } catch (err: any) {
      setErrorDrivers('Erro ao buscar motoristas.');
      setDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  React.useEffect(() => {
    if (companyId) {
      fetchVehicles();
      fetchDrivers();
    }
  }, [companyId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-2 py-1 text-base hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Gerenciamento de Frota</h1>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="drivers">Motoristas</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicles">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Veículos</h2>
            <Button onClick={handleAddVehicle} variant="default"><Plus className="h-4 w-4 mr-2" />Adicionar Veículo</Button>
          </div>
          {loadingVehicles && <p>Carregando veículos...</p>}
          {errorVehicles && <p className="text-red-500">{errorVehicles}</p>}
          {!loadingVehicles && !errorVehicles && vehicles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-muted-foreground text-lg">Nenhum veículo cadastrado ainda para esta empresa.</span>
            </div>
          )}
          {!loadingVehicles && !errorVehicles && vehicles.length > 0 && (
            <div className="space-y-3">
              {vehicles.map(vehicle => (
                <Card key={vehicle.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="font-semibold">{vehicle.plate}</span>
                      <Badge className={statusBadge[vehicle.status] || ''}>{vehicle.status}</Badge>
                      <span className="text-sm text-muted-foreground">{vehicle.model} • {vehicle.capacity}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2 items-center">
                    <Button size="sm" variant="outline" onClick={() => setShowVehicleDetails(vehicle)}><Eye className="h-4 w-4 mr-1" />Ver Detalhes</Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditVehicle(vehicle)}><Edit className="h-4 w-4 mr-1" />Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleVehicle(vehicle)}>
                      {vehicle.status === 'Inativo' ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      {vehicle.status === 'Inativo' ? 'Reativar' : 'Inativar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="drivers">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Motoristas</h2>
            <Button onClick={handleAddDriver} variant="default"><Plus className="h-4 w-4 mr-2" />Adicionar Motorista</Button>
          </div>
          {loadingDrivers && <p>Carregando motoristas...</p>}
          {errorDrivers && <p className="text-red-500">{errorDrivers}</p>}
          {!loadingDrivers && !errorDrivers && drivers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="text-muted-foreground text-lg">Nenhum motorista cadastrado ainda para esta empresa.</span>
            </div>
          )}
          {!loadingDrivers && !errorDrivers && drivers.length > 0 && (
            <div className="space-y-3">
              {drivers.map(driver => (
                <Card key={driver.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="font-semibold">{driver.name}</span>
                      <Badge className={statusBadge[driver.status] || ''}>{driver.status}</Badge>
                      <span className="text-sm text-muted-foreground">CNH: {driver.cnh} • {driver.phone}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2 items-center">
                    <Button size="sm" variant="outline" onClick={() => setShowDriverDetails(driver)}><Eye className="h-4 w-4 mr-1" />Ver Detalhes</Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditDriver(driver)}><Edit className="h-4 w-4 mr-1" />Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => handleToggleDriver(driver)}>
                      {driver.status === 'Inativo' ? <Check className="h-4 w-4 mr-1" /> : <X className="h-4 w-4 mr-1" />}
                      {driver.status === 'Inativo' ? 'Reativar' : 'Inativar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Adicionar/Editar Veículo */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVehicle && editingVehicle.id ? 'Editar Veículo' : 'Adicionar Veículo'}</DialogTitle>
            <DialogDescription>Preencha os dados do veículo.</DialogDescription>
          </DialogHeader>
          {editingVehicle && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2 relative">
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  value={editingVehicle.plate}
                  autoComplete="off"
                  onChange={e => setEditingVehicle({ ...editingVehicle, plate: e.target.value })}
                  placeholder="Digite ou selecione a placa do veículo"
                  onFocus={() => setShowPlateSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPlateSuggestions(false), 150)}
                />
                {editingVehicle.plate && showPlateSuggestions && (
                  <div className="absolute z-10 bg-white border rounded shadow w-full max-h-40 overflow-auto">
                    {vehicles.filter(v => v.plate.toLowerCase().includes(editingVehicle.plate.toLowerCase()) && v.plate !== editingVehicle.plate).map(v => (
                      <div
                        key={v.id}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onMouseDown={() => setEditingVehicle({ ...editingVehicle, plate: v.plate })}
                      >
                        {v.plate}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" value={editingVehicle.model} onChange={e => setEditingVehicle({ ...editingVehicle, model: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input id="capacity" value={editingVehicle.capacity} onChange={e => setEditingVehicle({ ...editingVehicle, capacity: e.target.value })} />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="driver">Motorista Responsável</Label>
                <Input
                  id="driver"
                  value={editingVehicle.driver}
                  autoComplete="off"
                  onChange={e => setEditingVehicle({ ...editingVehicle, driver: e.target.value })}
                  placeholder="Digite ou selecione o nome do motorista"
                  onFocus={() => setShowDriverSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowDriverSuggestions(false), 150)}
                />
                {editingVehicle.driver && showDriverSuggestions && (
                  <div className="absolute z-10 bg-white border rounded shadow w-full max-h-40 overflow-auto">
                    {drivers.filter(d => d.name.toLowerCase().includes(editingVehicle.driver.toLowerCase()) && d.name !== editingVehicle.driver).map(d => (
                      <div
                        key={d.id}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onMouseDown={() => setEditingVehicle({ ...editingVehicle, driver: d.name })}
                      >
                        {d.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Label htmlFor="vehicle-photo">Foto do Veículo</Label>
              <Input id="vehicle-photo" type="file" accept="image/*" onChange={handleVehiclePhotoChange} disabled={uploadingVehiclePhoto} />
              {uploadingVehiclePhoto && <span className="text-xs text-muted-foreground">Enviando foto...</span>}
              {vehiclePhotoError && <span className="text-xs text-red-500">{vehiclePhotoError}</span>}
              {editingVehicle.photo && (
                <img src={editingVehicle.photo} alt="Foto do Veículo" className="w-32 h-20 object-cover rounded mt-2" />
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVehicleDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveVehicle} disabled={!editingVehicle || !editingVehicle.plate || !editingVehicle.model}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Veículo */}
      <Dialog open={!!showVehicleDetails} onOpenChange={() => setShowVehicleDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Veículo</DialogTitle>
          </DialogHeader>
          {showVehicleDetails && (
            <div className="space-y-2">
              <div><b>Placa:</b> {showVehicleDetails.plate}</div>
              <div><b>Modelo:</b> {showVehicleDetails.model}</div>
              <div><b>Capacidade:</b> {showVehicleDetails.capacity}</div>
              <div><b>Status:</b> <Badge className={statusBadge[showVehicleDetails.status] || ''}>{showVehicleDetails.status}</Badge></div>
              <div><b>Motorista Responsável:</b> {showVehicleDetails.driver || '---'}</div>
              {showVehicleDetails.photo ? (
                <img src={showVehicleDetails.photo} alt="Foto do Veículo" className="w-40 h-28 object-cover rounded mb-2" />
              ) : (
                <div className="w-40 h-28 bg-gray-100 flex items-center justify-center rounded mb-2 text-gray-400 text-sm border border-dashed border-gray-300">
                  Sem foto do veículo
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowVehicleDetails(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar/Editar Motorista */}
      <Dialog open={showDriverDialog} onOpenChange={setShowDriverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDriver && editingDriver.id ? 'Editar Motorista' : 'Adicionar Motorista'}</DialogTitle>
            <DialogDescription>Preencha os dados do motorista.</DialogDescription>
          </DialogHeader>
          {editingDriver && (
            <div className="grid gap-4 py-4">
              {/* Nome do Motorista com autocomplete */}
              <div className="space-y-2 relative">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={editingDriver.name}
                  autoComplete="off"
                  onChange={e => setEditingDriver({ ...editingDriver, name: e.target.value })}
                  placeholder="Digite ou selecione o nome do motorista"
                  onFocus={() => setShowNameSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowNameSuggestions(false), 150)}
                />
                {editingDriver.name && showNameSuggestions && (
                  <div className="absolute z-10 bg-white border rounded shadow w-full max-h-40 overflow-auto">
                    {drivers.filter(d => d.name.toLowerCase().includes(editingDriver.name.toLowerCase()) && d.name !== editingDriver.name).map(d => (
                      <div
                        key={d.id}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onMouseDown={() => setEditingDriver({ ...editingDriver, name: d.name })}
                      >
                        {d.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* CNH */}
              <div className="space-y-2">
                <Label htmlFor="cnh">CNH</Label>
                <Input id="cnh" value={editingDriver.cnh} onChange={e => setEditingDriver({ ...editingDriver, cnh: e.target.value })} />
              </div>
              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={editingDriver.phone} onChange={e => setEditingDriver({ ...editingDriver, phone: e.target.value })} />
              </div>
              {/* Veículo Associado com autocomplete */}
              <div className="space-y-2 relative">
                <Label htmlFor="vehicle">Veículo Associado</Label>
                <Input
                  id="vehicle"
                  value={editingDriver.vehicle}
                  autoComplete="off"
                  onChange={e => setEditingDriver({ ...editingDriver, vehicle: e.target.value })}
                  placeholder="Digite ou selecione a placa do veículo"
                  onFocus={() => setShowVehicleSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowVehicleSuggestions(false), 150)}
                />
                {editingDriver.vehicle && showVehicleSuggestions && (
                  <div className="absolute z-10 bg-white border rounded shadow w-full max-h-40 overflow-auto">
                    {vehicles.filter(v => v.plate.toLowerCase().includes(editingDriver.vehicle.toLowerCase()) && v.plate !== editingDriver.vehicle).map(v => (
                      <div
                        key={v.id}
                        className="px-3 py-2 hover:bg-muted cursor-pointer"
                        onMouseDown={() => setEditingDriver({ ...editingDriver, vehicle: v.plate })}
                      >
                        {v.plate}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Label htmlFor="driver-photo">Foto do Motorista</Label>
              <Input id="driver-photo" type="file" accept="image/*" onChange={handleDriverPhotoChange} disabled={uploadingDriverPhoto} />
              {uploadingDriverPhoto && <span className="text-xs text-muted-foreground">Enviando foto...</span>}
              {driverPhotoError && <span className="text-xs text-red-500">{driverPhotoError}</span>}
              {editingDriver.photo && (
                <img src={editingDriver.photo} alt="Foto do Motorista" className="w-32 h-32 object-cover rounded mt-2" />
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDriverDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveDriver} disabled={!editingDriver || !editingDriver.name || !editingDriver.cnh}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Motorista */}
      <Dialog open={!!showDriverDetails} onOpenChange={() => setShowDriverDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Motorista</DialogTitle>
          </DialogHeader>
          {showDriverDetails && (
            <div className="space-y-2">
              <div><b>Nome:</b> {showDriverDetails.name}</div>
              <div><b>CNH:</b> {showDriverDetails.cnh}</div>
              <div><b>Telefone:</b> {showDriverDetails.phone}</div>
              <div><b>Status:</b> <Badge className={statusBadge[showDriverDetails.status] || ''}>{showDriverDetails.status}</Badge></div>
              <div><b>Veículo Associado:</b> {showDriverDetails.vehicle || '---'}</div>
              {showDriverDetails.photo ? (
                <img src={showDriverDetails.photo} alt="Foto do Motorista" className="w-32 h-32 object-cover rounded mb-2" />
              ) : (
                <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded mb-2 text-gray-400 text-sm border border-dashed border-gray-300">
                  Sem foto do motorista
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDriverDetails(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Rodapé padrão com espaçamento */}
      <div className="mt-8">
        <AppFooter />
      </div>
    </div>
  );
};

export default CompanyFleet; 