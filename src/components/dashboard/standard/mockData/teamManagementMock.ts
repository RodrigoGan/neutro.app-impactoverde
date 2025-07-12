export const cooperativeTeamMock = [
  {
    id: '1',
    name: 'Maria Alves',
    role: 'Cooperada',
    avatarUrl: '/avatars/maria.jpg',
    highlight: '970kg coletados',
    email: 'maria.alves@cooperativa.com',
    phone: '(41) 99999-0001',
    admission: '2017-06-01',
    status: 'Ativo',
    permissions: { gestor: true, financeiro: false },
    notes: 'Cooperada destaque do mês.',
    inactiveReason: undefined
  },
  {
    id: '2',
    name: 'João Pereira',
    role: 'Cooperado',
    avatarUrl: '/avatars/joao.jpg',
    highlight: '890kg coletados',
    email: 'joao.pereira@cooperativa.com',
    phone: '(41) 98888-0002',
    admission: '2018-03-15',
    status: 'Inativo',
    permissions: { gestor: false, financeiro: true },
    notes: 'Participa do projeto Recicla Mais.',
    inactiveReason: 'Afastado por férias'
  },
  {
    id: '3',
    name: 'Ana Santos',
    role: 'Supervisora',
    avatarUrl: '/avatars/ana.jpg',
    highlight: '850kg coletados',
    email: 'ana.santos@cooperativa.com',
    phone: '(41) 97777-0003',
    admission: '2019-10-20',
    status: 'Ativo',
    permissions: { gestor: true, financeiro: true },
    notes: 'Supervisora de operações.',
    inactiveReason: undefined
  },
  {
    id: '4',
    name: 'Carlos Souza',
    role: 'Cooperado',
    avatarUrl: '/avatars/carlos.jpg',
    email: 'carlos.souza@cooperativa.com',
    phone: '(41) 96666-0004',
    admission: '2021-01-05',
    status: 'Excluído',
    permissions: { gestor: false, financeiro: false },
    notes: 'Novo integrante da equipe.',
    inactiveReason: undefined
  }
];

export const collectorCompanyTeamMock = [
  {
    id: '1',
    name: 'Fernanda Lima',
    role: 'Gerente',
    avatarUrl: '/avatars/fernanda.jpg',
    highlight: '5 anos',
    email: 'fernanda.lima@empresa.com',
    phone: '(51) 99999-1234',
    admission: '2016-09-01',
    status: 'Ativo',
    permissions: { gestor: true, financeiro: true },
    notes: 'Gestora da equipe de coleta.',
    inactiveReason: undefined
  },
  {
    id: '2',
    name: 'Ricardo Silva',
    role: 'Motorista',
    avatarUrl: '/avatars/ricardo.jpg',
    highlight: '120 rotas',
    email: 'ricardo.silva@empresa.com',
    phone: '(51) 98888-5678',
    admission: '2018-02-10',
    status: 'Ativo',
    permissions: { gestor: false, financeiro: false },
    notes: 'Motorista premiado em 2022.',
    inactiveReason: undefined
  },
  {
    id: '3',
    name: 'Patrícia Gomes',
    role: 'Administrativo',
    avatarUrl: '/avatars/patricia.jpg',
    highlight: 'Top 1 desempenho',
    email: 'patricia.gomes@empresa.com',
    phone: '(51) 97777-4321',
    admission: '2019-11-25',
    status: 'Inativo',
    permissions: { gestor: false, financeiro: true },
    notes: 'Responsável pelo setor administrativo.',
    inactiveReason: 'Licença médica'
  }
];

export const partnerTeamMock = [
  {
    id: '1',
    name: 'João Silva',
    role: 'Gerente',
    avatarUrl: '/avatars/employee1.jpg',
    highlight: '3 cupons'
  },
  {
    id: '2',
    name: 'Maria Santos',
    role: 'Atendente',
    avatarUrl: '/avatars/employee2.jpg',
    highlight: '2 cupons'
  },
  {
    id: '3',
    name: 'Carlos Souza',
    role: 'Caixa',
    avatarUrl: '/avatars/employee3.jpg',
    highlight: '1 cupom'
  }
];

export const restaurantPartnerTeamMock = [
  {
    id: '1',
    name: 'Lucas Oliveira',
    role: 'Chef de Cozinha',
    avatarUrl: '/avatars/chef.jpg',
    highlight: '5 pratos do mês',
    email: 'lucas.oliveira@restaurante.com',
    phone: '(11) 99999-1111',
    admission: '2021-03-15',
    status: 'Ativo',
    permissions: { gestor: true, financeiro: false },
    notes: 'Responsável pelo cardápio sustentável.',
    inactiveReason: undefined
  },
  {
    id: '2',
    name: 'Fernanda Souza',
    role: 'Atendente',
    avatarUrl: '/avatars/atendente.jpg',
    highlight: '12 cupons servidos',
    email: 'fernanda.souza@restaurante.com',
    phone: '(11) 98888-2222',
    admission: '2022-01-10',
    status: 'Inativo',
    permissions: { gestor: false, financeiro: true },
    notes: 'Atendimento premiado em 2023.',
    inactiveReason: 'Desligado'
  },
  {
    id: '3',
    name: 'Carlos Lima',
    role: 'Gerente',
    avatarUrl: '/avatars/gerente.jpg',
    highlight: '2 anos',
    email: 'carlos.lima@restaurante.com',
    phone: '(11) 97777-3333',
    admission: '2020-07-01',
    status: 'Ativo',
    permissions: { gestor: true, financeiro: true },
    notes: 'Gestor geral do restaurante.',
    inactiveReason: undefined
  }
];

export const storePartnerTeamMock = [
  {
    id: '1',
    name: 'Patrícia Silva',
    role: 'Vendedora',
    avatarUrl: '/avatars/vendedora.jpg',
    highlight: '8 cupons validados',
    email: 'patricia.silva@loja.com',
    phone: '(21) 99999-4444',
    admission: '2021-05-20',
    status: 'Ativo',
    permissions: { gestor: false, financeiro: true },
    notes: 'Especialista em vendas verdes.',
    inactiveReason: undefined
  },
  {
    id: '2',
    name: 'Roberto Costa',
    role: 'Caixa',
    avatarUrl: '/avatars/caixa.jpg',
    highlight: '5 anos',
    email: 'roberto.costa@loja.com',
    phone: '(21) 98888-5555',
    admission: '2019-09-12',
    status: 'Ativo',
    permissions: { gestor: false, financeiro: true },
    notes: 'Responsável pelo caixa sustentável.',
    inactiveReason: undefined
  },
  {
    id: '3',
    name: 'Juliana Alves',
    role: 'Gerente',
    avatarUrl: '/avatars/gerente2.jpg',
    highlight: 'Top atendimento',
    email: 'juliana.alves@loja.com',
    phone: '(21) 97777-6666',
    admission: '2018-11-03',
    status: 'Excluído',
    permissions: { gestor: true, financeiro: true },
    notes: 'Gerente com foco em sustentabilidade.',
    inactiveReason: 'Licença maternidade'
  }
];

export const educationalPartnerTeamMock = [
  {
    id: '1',
    name: 'Mariana Rocha',
    role: 'Professora',
    avatarUrl: '/avatars/professora.jpg',
    highlight: '20 aulas verdes',
    email: 'mariana.rocha@escola.com',
    phone: '(31) 99999-7777',
    admission: '2020-02-14',
    status: 'Ativo',
    permissions: { gestor: false, financeiro: false },
    notes: 'Professora de educação ambiental.',
    inactiveReason: undefined
  },
  {
    id: '2',
    name: 'Eduardo Ramos',
    role: 'Coordenador',
    avatarUrl: '/avatars/coordenador.jpg',
    highlight: '3 projetos ativos',
    email: 'eduardo.ramos@escola.com',
    phone: '(31) 98888-8888',
    admission: '2019-08-25',
    status: 'Inativo',
    permissions: { gestor: true, financeiro: false },
    notes: 'Coordena projetos de reciclagem.',
    inactiveReason: 'Afastado para estudos'
  },
  {
    id: '3',
    name: 'Sofia Martins',
    role: 'Estagiária',
    avatarUrl: '/avatars/estagiaria.jpg',
    highlight: '10 cupons entregues',
    email: 'sofia.martins@escola.com',
    phone: '(31) 97777-9999',
    admission: '2022-04-10',
    status: 'Ativo',
    permissions: { gestor: false, financeiro: false },
    notes: 'Estagiária de apoio pedagógico.',
    inactiveReason: undefined
  }
]; 