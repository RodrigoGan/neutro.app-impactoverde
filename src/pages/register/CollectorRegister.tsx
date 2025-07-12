import React from 'react';
import Layout from '@/components/Layout';
import { CollectorRegisterForm } from '@/components/forms/CollectorRegisterForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const CollectorRegister: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = async (data: any) => {
    try {
      // Aqui você implementaria a lógica de cadastro no backend
      console.log('Dados do coletor (empresa):', data);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/company-collectors');
    } catch (error) {
      toast.error('Erro ao realizar cadastro. Tente novamente.');
      console.error('Erro no cadastro:', error);
    }
  };

  const handleCancel = () => {
    navigate('/company-collectors', { state: { userId: location.state?.userId } });
  };

  return (
    <Layout>
      <div className="container py-8 px-4 md:px-6">
        <CollectorRegisterForm
          mode="company"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
};

export default CollectorRegister;
