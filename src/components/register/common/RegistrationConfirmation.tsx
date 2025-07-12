import React from 'react';

interface RegistrationConfirmationProps {
  name: string;
  email: string;
  document: string;
  phone: string;
  address: {
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep?: string;
  };
  image?: File | null;
}

const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
  name,
  email,
  document,
  phone,
  address,
  image
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <span className="text-green-600 text-5xl mb-2">✔</span>
        <h2 className="text-xl font-bold mb-2">Confirme seu Cadastro</h2>
        <p className="text-muted-foreground mb-4">Revise as informações abaixo e confirme seu cadastro</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold mb-2 text-center">Seus Dados</h3>
        {image && (
          <div className="flex justify-center mb-2">
            <img
              src={URL.createObjectURL(image)}
              alt="Foto de perfil"
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        )}
        <div className="space-y-1 text-sm text-center">
          <div><strong>Nome:</strong> {name}</div>
          <div><strong>E-mail:</strong> {email}</div>
          <div><strong>Documento:</strong> {document}</div>
          <div><strong>Telefone:</strong> {phone}</div>
          <div><strong>Endereço:</strong> {address.rua}, {address.numero}{address.complemento ? `, ${address.complemento}` : ''}, {address.bairro}, {address.cidade} - {address.estado}</div>
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Termos e Condições</h3>
        <ul className="list-disc ml-6 text-sm mb-2">
          <li>Compromisso com práticas sustentáveis e gestão adequada de resíduos</li>
          <li>Fornecimento de informações verdadeiras e atualizadas</li>
          <li>Participação ativa nos programas de sustentabilidade</li>
          <li>Respeito às políticas de privacidade e proteção de dados</li>
        </ul>
        <p className="text-xs text-muted-foreground">Ao confirmar seu cadastro, você concorda com os termos acima.</p>
      </div>
    </div>
  );
};

export default RegistrationConfirmation; 