import type { UserCollection, OcorrenciaRecorrente } from '@/pages/user/UserHistory';

// Função utilitária para gerar ocorrências recorrentes com próxima futura bem distante
function gerarOcorrencias(baseDate: Date, frequencia: 'semanal' | 'quinzenal' | 'mensal', diasSemana: string[], materiais: any[]): OcorrenciaRecorrente[] {
  const ocorrencias: OcorrenciaRecorrente[] = [];
  let diasIntervalo = 7;
  if (frequencia === 'quinzenal') diasIntervalo = 14;
  if (frequencia === 'mensal') diasIntervalo = 30;
  // 2 passadas
  for (let i = 2; i > 0; i--) {
    const data = new Date(baseDate);
    data.setDate(data.getDate() - i * diasIntervalo);
    ocorrencias.push({
      id: `past-${i}`,
      data,
      horario: '15:00',
      status: 'collected',
      materiais,
    });
  }
  // Próxima futura bem distante
  const dataFutura = new Date(2025, 11, 30); // 30 de dezembro de 2025
  ocorrencias.push({
    id: 'future-1',
    data: dataFutura,
    horario: '15:00',
    status: 'scheduled',
    materiais,
  });
  return ocorrencias;
}

// Função utilitária para gerar coletas recorrentes mockadas
function gerarColetasRecorrentesMock(
  baseDate: Date,
  frequencia: 'semanal' | 'quinzenal' | 'mensal',
  quantidadePassadas: number = 6,
  quantidadeFuturas: number = 1,
  dadosBase: Partial<UserCollection> = {}
): UserCollection[] {
  const coletas: UserCollection[] = [];
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  let diasIntervalo = 7;
  if (frequencia === 'quinzenal') diasIntervalo = 14;
  if (frequencia === 'mensal') diasIntervalo = 30;

  // Para empresas parceiras, NÃO gerar coletas recorrentes com status 'collected'
  const isEmpresa = dadosBase.tipoUsuario === 'empresa' || (dadosBase.empresa !== undefined);

  // Passadas
  if (!isEmpresa) {
    for (let i = quantidadePassadas; i > 0; i--) {
      const data = new Date(baseDate);
      data.setDate(data.getDate() - i * diasIntervalo);
      coletas.push({
        ...dadosBase,
        id: i,
        date: data,
        time: dadosBase.time || '14:00',
        status: 'collected',
        tipoColeta: 'recorrente',
        frequencia,
        tipoUsuario: dadosBase.tipoUsuario || 'individual',
        empresa: dadosBase.empresa,
        coletor: dadosBase.coletor,
        materials: dadosBase.materials || [],
        address: dadosBase.address || '',
        neighborhood: dadosBase.neighborhood || '',
        city: dadosBase.city || '',
        state: dadosBase.state || '',
        fotos: [],
        diasSemana: dadosBase.diasSemana || [],
        proximaColeta: dadosBase.proximaColeta || new Date(data),
        ocorrencias: gerarOcorrencias(data, frequencia, dadosBase.diasSemana || [], dadosBase.materials || [])
      } as UserCollection);
    }
  }
  // Futuras (apenas 1)
  for (let i = 1; i <= quantidadeFuturas; i++) {
    const data = new Date(baseDate);
    data.setDate(data.getDate() + i * diasIntervalo);
    coletas.push({
      ...dadosBase,
      id: quantidadePassadas + i,
      date: data,
      time: dadosBase.time || '14:00',
      status: 'scheduled',
      tipoColeta: 'recorrente',
      frequencia,
      tipoUsuario: dadosBase.tipoUsuario || 'empresa',
      empresa: dadosBase.empresa,
      coletor: dadosBase.coletor,
      materials: dadosBase.materials || [],
      address: dadosBase.address || '',
      neighborhood: dadosBase.neighborhood || '',
      city: dadosBase.city || '',
      state: dadosBase.state || '',
      fotos: [],
      diasSemana: dadosBase.diasSemana || [],
      proximaColeta: dadosBase.proximaColeta || new Date(data),
      ocorrencias: gerarOcorrencias(data, frequencia, dadosBase.diasSemana || [], dadosBase.materials || [])
    } as UserCollection);
  }
  return coletas;
}

// Dados mockados para restaurante parceiro
export const restaurantPartnerCollections: UserCollection[] = [
  // Pendente
  {
    id: 1,
    date: new Date(2024, 3, 24),
    time: '09:00',
    address: 'Rua dos Restaurantes, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Óleo de Cozinha', quantity: '50', unit: 'L' },
      { type: 'Papel', quantity: '20', unit: 'kg' },
      { type: 'Plástico', quantity: '15', unit: 'kg' }
    ],
    status: 'pending',
    tipoColeta: 'recorrente',
    frequencia: 'semanal',
    diasSemana: ['seg', 'qua', 'sex'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Restaurante Sabor & Cia',
      cnpj: '12.345.678/0001-90',
      responsavel: 'João Silva'
    },
    fotos: [],
    observacoes: 'Coleta de óleo de cozinha usado e materiais recicláveis do restaurante.',
    ocorrencias: gerarOcorrencias(new Date(2024, 3, 24), 'semanal', ['seg', 'qua', 'sex'], [
      { type: 'Óleo de Cozinha', quantity: '50', unit: 'L' },
      { type: 'Papel', quantity: '20', unit: 'kg' },
      { type: 'Plástico', quantity: '15', unit: 'kg' }
    ])
  },
  // Agendada
  {
    id: 2,
    date: new Date(2024, 3, 25),
    time: '09:00',
    address: 'Rua dos Restaurantes, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Óleo de Cozinha', quantity: '50', unit: 'L' },
      { type: 'Papel', quantity: '20', unit: 'kg' },
      { type: 'Plástico', quantity: '15', unit: 'kg' }
    ],
    status: 'scheduled',
    tipoColeta: 'recorrente',
    frequencia: 'semanal',
    diasSemana: ['seg', 'qua', 'sex'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Restaurante Sabor & Cia',
      cnpj: '12.345.678/0001-90',
      responsavel: 'João Silva'
    },
    coletor: {
      nome: 'Carlos Coletor',
      foto: 'https://github.com/shadcn.png',
      telefone: '(11) 91234-5678',
      avaliacaoMedia: 4.9,
      totalColetas: 200,
      verificado: true,
      modalidadeTransporte: 'carro'
    },
    fotos: [],
    observacoes: 'Coleta de óleo de cozinha usado e materiais recicláveis do restaurante.',
    ocorrencias: gerarOcorrencias(new Date(2024, 3, 25), 'semanal', ['seg', 'qua', 'sex'], [
      { type: 'Óleo de Cozinha', quantity: '50', unit: 'L' },
      { type: 'Papel', quantity: '20', unit: 'kg' },
      { type: 'Plástico', quantity: '15', unit: 'kg' }
    ])
  },
  // Cancelada
  {
    id: 3,
    date: new Date(2024, 3, 26),
    time: '09:00',
    address: 'Rua dos Restaurantes, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Óleo de Cozinha', quantity: '50', unit: 'L' },
      { type: 'Papel', quantity: '20', unit: 'kg' },
      { type: 'Plástico', quantity: '15', unit: 'kg' }
    ],
    status: 'cancelled',
    tipoColeta: 'recorrente',
    frequencia: 'semanal',
    diasSemana: ['seg', 'qua', 'sex'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Restaurante Sabor & Cia',
      cnpj: '12.345.678/0001-90',
      responsavel: 'João Silva'
    },
    coletor: {
      nome: 'Carlos Coletor',
      foto: 'https://github.com/shadcn.png',
      telefone: '(11) 91234-5678',
      avaliacaoMedia: 4.9,
      totalColetas: 200,
      verificado: true,
      modalidadeTransporte: 'carro'
    },
    fotos: [],
    observacoes: 'Coleta de óleo de cozinha usado e materiais recicláveis do restaurante.',
    cancellationReason: 'Solicitante pediu cancelamento por férias.',
    ocorrencias: [
      {
        id: 'cancelada-1',
        data: new Date(2024, 3, 26),
        horario: '09:00',
        status: 'cancelled',
        observacao: 'Solicitante pediu cancelamento por férias.'
      },
      {
        id: 'realizada-1',
        data: new Date(2024, 3, 19),
        horario: '09:00',
        status: 'collected',
        materiais: [
          { type: 'Óleo de Cozinha', quantity: '50', unit: 'L' },
          { type: 'Papel', quantity: '20', unit: 'kg' },
          { type: 'Plástico', quantity: '15', unit: 'kg' }
        ]
      }
    ]
  },
  // Exemplo de coleta simples cancelada
  {
    id: 10,
    date: new Date(2024, 3, 28),
    time: '10:00',
    address: 'Rua Exemplo, 100',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Vidro', quantity: '5', unit: 'kg' }
    ],
    status: 'cancelled',
    tipoColeta: 'simples',
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Empresa Exemplo',
      cnpj: '00.000.000/0001-00',
      responsavel: 'Maria Exemplo'
    },
    cancellationReason: 'Solicitante pediu cancelamento por mudança de endereço.',
    fotos: [],
    observacoes: 'Cancelada por mudança de endereço.'
  }
];

// Dados mockados para loja parceira
export const storePartnerCollections: UserCollection[] = [
  // Pendente
  {
    id: 4,
    date: new Date(2024, 3, 24),
    time: '14:00',
    address: 'Rua do Comércio, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Papel', quantity: '100', unit: 'kg' },
      { type: 'Plástico', quantity: '50', unit: 'kg' },
      { type: 'Papelão', quantity: '80', unit: 'kg' }
    ],
    status: 'pending',
    tipoColeta: 'recorrente',
    frequencia: 'quinzenal',
    diasSemana: ['ter', 'sex'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Supermercado Econômico',
      cnpj: '23.456.789/0001-12',
      responsavel: 'José Pereira'
    },
    fotos: [],
    observacoes: 'Coleta de materiais recicláveis do supermercado.',
    ocorrencias: gerarOcorrencias(new Date(2024, 3, 24), 'quinzenal', ['ter', 'sex'], [
      { type: 'Papel', quantity: '100', unit: 'kg' },
      { type: 'Plástico', quantity: '50', unit: 'kg' },
      { type: 'Papelão', quantity: '80', unit: 'kg' }
    ])
  },
  // Agendada
  {
    id: 5,
    date: new Date(2024, 3, 25),
    time: '14:00',
    address: 'Rua do Comércio, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Papel', quantity: '100', unit: 'kg' },
      { type: 'Plástico', quantity: '50', unit: 'kg' },
      { type: 'Papelão', quantity: '80', unit: 'kg' }
    ],
    status: 'scheduled',
    tipoColeta: 'recorrente',
    frequencia: 'quinzenal',
    diasSemana: ['ter', 'sex'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Supermercado Econômico',
      cnpj: '23.456.789/0001-12',
      responsavel: 'José Pereira'
    },
    coletor: {
      nome: 'Marina Coletora',
      foto: 'https://github.com/shadcn.png',
      telefone: '(11) 92345-6789',
      avaliacaoMedia: 4.7,
      totalColetas: 150,
      verificado: true,
      modalidadeTransporte: 'moto'
    },
    fotos: [],
    observacoes: 'Coleta de materiais recicláveis do supermercado.',
    ocorrencias: gerarOcorrencias(new Date(2024, 3, 25), 'quinzenal', ['ter', 'sex'], [
      { type: 'Papel', quantity: '100', unit: 'kg' },
      { type: 'Plástico', quantity: '50', unit: 'kg' },
      { type: 'Papelão', quantity: '80', unit: 'kg' }
    ])
  },
  // Cancelada
  {
    id: 6,
    date: new Date(2024, 3, 26),
    time: '14:00',
    address: 'Rua do Comércio, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Papel', quantity: '100', unit: 'kg' },
      { type: 'Plástico', quantity: '50', unit: 'kg' },
      { type: 'Papelão', quantity: '80', unit: 'kg' }
    ],
    status: 'cancelled',
    tipoColeta: 'recorrente',
    frequencia: 'quinzenal',
    diasSemana: ['ter', 'sex'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Supermercado Econômico',
      cnpj: '23.456.789/0001-12',
      responsavel: 'José Pereira'
    },
    coletor: {
      nome: 'Marina Coletora',
      foto: 'https://github.com/shadcn.png',
      telefone: '(11) 92345-6789',
      avaliacaoMedia: 4.7,
      totalColetas: 150,
      verificado: true,
      modalidadeTransporte: 'moto'
    },
    fotos: [],
    observacoes: 'Coleta de materiais recicláveis do supermercado.',
    cancellationReason: 'Cancelada por motivo de reforma no supermercado.',
    ocorrencias: gerarOcorrencias(new Date(2024, 3, 26), 'quinzenal', ['ter', 'sex'], [
      { type: 'Papel', quantity: '100', unit: 'kg' },
      { type: 'Plástico', quantity: '50', unit: 'kg' },
      { type: 'Papelão', quantity: '80', unit: 'kg' }
    ])
  }
];

// Dados mockados para instituição educacional parceira
export const educationalPartnerCollections: UserCollection[] = [
  // Pendente
  {
    id: 7,
    date: new Date(2024, 3, 24),
    time: '10:00',
    address: 'Rua da Educação, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Papel', quantity: '200', unit: 'kg' },
      { type: 'Plástico', quantity: '100', unit: 'kg' },
      { type: 'Papelão', quantity: '150', unit: 'kg' }
    ],
    status: 'pending',
    tipoColeta: 'recorrente',
    frequencia: 'mensal',
    diasSemana: ['qua'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Escola Municipal',
      cnpj: '34.567.890/0001-78',
      responsavel: 'Maria Oliveira'
    },
    fotos: [],
    observacoes: 'Coleta de materiais recicláveis da escola.',
    ocorrencias: gerarOcorrencias(new Date(2024, 3, 24), 'mensal', ['qua'], [
      { type: 'Papel', quantity: '200', unit: 'kg' },
      { type: 'Plástico', quantity: '100', unit: 'kg' },
      { type: 'Papelão', quantity: '150', unit: 'kg' }
    ])
  },
  // Agendada
  {
    id: 8,
    date: new Date(2024, 3, 25),
    time: '10:00',
    address: 'Rua da Educação, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Papel', quantity: '200', unit: 'kg' },
      { type: 'Plástico', quantity: '100', unit: 'kg' },
      { type: 'Papelão', quantity: '150', unit: 'kg' }
    ],
    status: 'scheduled',
    tipoColeta: 'recorrente',
    frequencia: 'mensal',
    diasSemana: ['qua'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Escola Municipal',
      cnpj: '34.567.890/0001-78',
      responsavel: 'Maria Oliveira'
    },
    coletor: {
      nome: 'Eduardo Coletor',
      foto: 'https://github.com/shadcn.png',
      telefone: '(11) 93456-7890',
      avaliacaoMedia: 4.8,
      totalColetas: 180,
      verificado: true,
      modalidadeTransporte: 'bicicleta'
    },
    fotos: [],
    observacoes: 'Coleta de materiais recicláveis da escola.',
    ocorrencias: gerarOcorrencias(new Date(2024, 3, 25), 'mensal', ['qua'], [
      { type: 'Papel', quantity: '200', unit: 'kg' },
      { type: 'Plástico', quantity: '100', unit: 'kg' },
      { type: 'Papelão', quantity: '150', unit: 'kg' }
    ])
  },
  // Cancelada
  {
    id: 9,
    date: new Date(2024, 3, 26),
    time: '10:00',
    address: 'Rua da Educação, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    materials: [
      { type: 'Papel', quantity: '200', unit: 'kg' },
      { type: 'Plástico', quantity: '100', unit: 'kg' },
      { type: 'Papelão', quantity: '150', unit: 'kg' }
    ],
    status: 'cancelled',
    tipoColeta: 'recorrente',
    frequencia: 'mensal',
    diasSemana: ['qua'],
    proximaColeta: new Date(2025, 11, 30),
    tipoUsuario: 'empresa',
    empresa: {
      nome: 'Escola Municipal',
      cnpj: '34.567.890/0001-78',
      responsavel: 'Maria Oliveira'
    },
    coletor: {
      nome: 'Eduardo Coletor',
      foto: 'https://github.com/shadcn.png',
      telefone: '(11) 93456-7890',
      avaliacaoMedia: 4.8,
      totalColetas: 180,
      verificado: true,
      modalidadeTransporte: 'bicicleta'
    },
    fotos: [],
    observacoes: 'Coleta de materiais recicláveis da escola.',
    cancellationReason: 'Cancelada devido a feriado escolar.',
    ocorrencias: gerarOcorrencias(new Date(2024, 3, 26), 'mensal', ['qua'], [
      { type: 'Papel', quantity: '200', unit: 'kg' },
      { type: 'Plástico', quantity: '100', unit: 'kg' },
      { type: 'Papelão', quantity: '150', unit: 'kg' }
    ])
  }
]; 