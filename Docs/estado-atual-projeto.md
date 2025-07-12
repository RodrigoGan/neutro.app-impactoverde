# Documentação do Estado Atual do Projeto

## 1. Visão Geral
O projeto é uma plataforma de gestão ambiental e reciclagem, construída com React e TypeScript, utilizando Vite como bundler. O sistema possui diferentes tipos de usuários com suas respectivas interfaces e permissões.

## 2. Estrutura de Usuários

### 2.1 Tipos de Usuários e Suas Funções

1. **Partner Admin (Empresa Parceira)**
   - Dashboard: `PartnerAdminDashboard.tsx`
   - Funcionalidades:
     - Criação e gestão de cupons
     - Gerenciamento de descontos
     - Validação de cupons
     - Gestão de funcionários
     - Métricas de desempenho

2. **Cooperative Administrator**
   - Dashboard: `CooperativeAdministratorDashboard.tsx`
   - Funcionalidades:
     - Gestão de cooperados
     - Controle de entrada de materiais
     - Relatórios financeiros
     - Métricas operacionais

3. **Company Administrator**
   - Dashboard: `CompanyAdministratorDashboard.tsx`
   - Funcionalidades:
     - Gestão de coletores
     - Controle de frotas
     - Métricas de coleta
     - Gestão financeira

4. **Common User**
   - Dashboard: `CommonUserDashboard.tsx`
   - Funcionalidades:
     - Solicitação de coletas
     - Visualização de cupons
     - Histórico de coletas
     - Agendamentos

5. **Collector**
   - Dashboard: `CollectorDashboard.tsx`
   - Funcionalidades:
     - Visualização de rotas
     - Registro de coletas
     - Atualização de status
     - Consulta de preços

6. **Outros Perfis**
   - Super User (`SuperUserDashboard.tsx`)
   - Restricted User (`RestrictedUserDashboard.tsx`)
   - Cooperative Manager (`CooperativeManagerDashboard.tsx`)
   - Company Dashboard (`CompanyDashboard.tsx`)

## 3. Estrutura Técnica

### 3.1 Tecnologias Principais
```json
{
  "Frontend": {
    "Framework": "React 18",
    "Language": "TypeScript",
    "Bundler": "Vite",
    "UI Components": "Shadcn/UI",
    "Styling": "TailwindCSS",
    "State Management": "React Query",
    "Routing": "React Router",
    "Form Handling": "React Hook Form",
    "Validation": "Zod"
  }
}
```

### 3.2 Estrutura de Diretórios
```
src/
├── pages/
│   ├── auth/         # Páginas de autenticação
│   ├── dashboard/    # Dashboards específicos
│   └── register/     # Páginas de registro
├── components/
│   ├── ui/          # Componentes de UI reutilizáveis
│   └── layout/      # Componentes de layout
├── contexts/        # Contextos React
├── lib/            # Utilitários
└── hooks/          # Hooks personalizados
```

## 4. Funcionalidades Comuns entre Dashboards

### 4.1 Componentes Compartilhados
1. **Header**
   - Logo
   - Navegação principal
   - Perfil do usuário
   - Notificações

2. **Métricas**
   - Cards de estatísticas
   - Gráficos de desempenho
   - Indicadores de progresso

3. **Ações Rápidas**
   - Botões de ação principais
   - Menu de navegação rápida

### 4.2 Elementos de UI Recorrentes
- Cards
- Botões de ação
- Tabelas de dados
- Formulários
- Modais
- Badges de status

## 5. Integrações e APIs

### 5.1 Bibliotecas de Componentes
- Radix UI (base para Shadcn)
- Recharts (gráficos)
- Lucide React (ícones)
- React Day Picker (calendário)
- Sonner (notificações)

### 5.2 Gerenciamento de Estado
- React Query para chamadas API
- Contextos React para estado global
- Hooks personalizados para lógica reutilizável

## 6. Pontos de Atenção

### 6.1 Duplicação de Código
- Componentes similares em diferentes dashboards
- Lógica de permissões repetida
- Estilos e layouts duplicados

### 6.2 Manutenibilidade
- Arquivos grandes (alguns com mais de 800 linhas)
- Lógica de negócio misturada com UI
- Necessidade de refatoração para melhor organização

## 7. Próximos Passos Sugeridos

1. **Componentização**
   - Extrair componentes comuns
   - Criar biblioteca de componentes compartilhados
   - Padronizar interfaces

2. **Sistema de Permissões**
   - Centralizar controle de acesso
   - Criar tipos e interfaces para permissões
   - Implementar hooks de autorização

3. **Documentação**
   - Documentar componentes
   - Criar guia de estilos
   - Documentar fluxos de negócio 