import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { CollectorRegisterForm } from '@/components/forms/CollectorRegisterForm';
import { toast } from 'sonner';

// Mock de coletores (substituir por fetch real futuramente)
const MOCK_COLLECTORS = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    neighborhood: 'Jardim Paulista',
    city: 'São Paulo',
    state: 'SP',
    region: 'Jardim Paulista',
    hasSmartphone: true,
    vehicleType: 'Caminhão',
    materiaisAceitos: ['papel', 'plastico'],
    periodosDisponiveis: ['manha', 'tarde'],
    photo: null,
  },
  {
    id: '2',
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria@email.com',
    phone: '(11) 98888-8888',
    address: 'Av. Paulista, 1000',
    neighborhood: 'Vila Mariana',
    city: 'São Paulo',
    state: 'SP',
    region: 'Vila Mariana',
    hasSmartphone: false,
    vehicleType: 'Bicicleta',
    materiaisAceitos: ['vidro', 'metal'],
    periodosDisponiveis: ['tarde'],
    photo: null,
  },
];

const EditCollector: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [collector, setCollector] = useState<any | null>(null);

  useEffect(() => {
    // Buscar dados do coletor pelo id (mock)
    const found = MOCK_COLLECTORS.find(c => String(c.id) === String(id));
    if (found) setCollector(found);
    else setCollector('notfound');
  }, [id]);

  if (collector === null) {
    return <Layout><div className="container py-8">Carregando dados do coletor...</div></Layout>;
  }
  if (collector === 'notfound') {
    return <Layout><div className="container py-8 text-red-600 font-bold">Coletor não encontrado!</div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Editar Coletor</h1>
        <CollectorRegisterForm
          mode="company"
          onSuccess={() => {
            toast.success('Dados do coletor atualizados!');
            navigate('/company-collectors', { state: { userId: location.state?.userId } });
          }}
          onCancel={() => navigate('/company-collectors', { state: { userId: location.state?.userId } })}
          initialValues={collector}
        />
      </div>
    </Layout>
  );
};

export default EditCollector; 