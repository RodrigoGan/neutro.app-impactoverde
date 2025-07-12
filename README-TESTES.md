# Guia de Testes - Neutro

Este documento descreve como executar e escrever testes para o projeto Neutro.

## 📋 Visão Geral

O projeto Neutro possui uma estrutura de testes completa com:

- **Testes Unitários**: Vitest + Testing Library
- **Testes de Integração**: Vitest + Testing Library
- **Testes E2E**: Cypress
- **Cobertura de Código**: Relatórios de cobertura

## 🚀 Executando Testes

### Testes Unitários e de Integração

```bash
# Executar todos os testes unitários
npm run test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Executar testes com interface gráfica
npm run test:ui

# Executar testes com relatório de cobertura
npm run test:coverage
```

### Testes E2E

```bash
# Executar testes E2E em modo headless
npm run test:e2e

# Abrir Cypress para testes interativos
npm run test:e2e:open
```

### Todos os Testes

```bash
# Executar todos os tipos de teste
npm run test:all
```

## 📁 Estrutura de Testes

```
src/
├── components/
│   └── forms/
│       ├── MaterialForm.tsx
│       └── MaterialForm.test.tsx
├── hooks/
│   ├── useLevels.ts
│   └── useLevels.test.ts
├── utils/
│   └── validation.test.ts
└── services/
    └── PointsService.test.ts

cypress/
├── e2e/
│   ├── home.cy.ts
│   └── auth.cy.ts
├── support/
│   ├── e2e.ts
│   └── commands.ts
└── cypress.config.ts
```

## ✍️ Escrevendo Testes

### Testes Unitários (Vitest)

#### Testando Componentes

```typescript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MeuComponente } from './MeuComponente';

// Mock de hooks ou dependências
vi.mock('@/hooks/useExemplo', () => ({
  useExemplo: () => ({
    data: [],
    loading: false,
    error: null
  })
}));

describe('MeuComponente', () => {
  it('deve renderizar corretamente', () => {
    render(<MeuComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });
});
```

#### Testando Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useMeuHook } from './useMeuHook';

describe('useMeuHook', () => {
  it('deve retornar dados corretos', async () => {
    const { result } = renderHook(() => useMeuHook());
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

#### Testando Funções Utilitárias

```typescript
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from './utils';

describe('minhaFuncao', () => {
  it('deve processar entrada corretamente', () => {
    const resultado = minhaFuncao('entrada');
    expect(resultado).toBe('saída esperada');
  });
});
```

### Testes E2E (Cypress)

#### Estrutura Básica

```typescript
describe('Funcionalidade', () => {
  beforeEach(() => {
    cy.visit('/pagina');
  });

  it('deve executar ação específica', () => {
    cy.get('[data-testid="botao"]').click();
    cy.contains('Resultado esperado').should('be.visible');
  });
});
```

#### Comandos Customizados

O projeto possui comandos customizados:

```typescript
// Login
cy.login('email@exemplo.com', 'senha123');

// Logout
cy.logout();

// Verificar se está logado
cy.isLoggedIn();

// Limpar dados de teste
cy.clearTestData();
```

## 🎯 Boas Práticas

### Testes Unitários

1. **Nomes Descritivos**: Use nomes que descrevam o comportamento esperado
2. **Arrange-Act-Assert**: Estruture testes em 3 partes claras
3. **Mocks Inteligentes**: Mock apenas o necessário
4. **Teste de Edge Cases**: Inclua casos extremos e de erro

### Testes E2E

1. **Teste de Fluxos Completos**: Foque em jornadas do usuário
2. **Seletores Estáveis**: Use `data-testid` quando possível
3. **Aguarde Elementos**: Use `cy.wait()` ou `cy.should()` adequadamente
4. **Limpe Dados**: Sempre limpe dados de teste

### Cobertura

- **Mínimo**: 70% de cobertura
- **Ideal**: 80%+ de cobertura
- **Foque**: Lógica de negócio e componentes críticos

## 🔧 Configuração

### Vitest

Configurado em `vitest.config.ts`:
- Ambiente jsdom para React
- Suporte a TypeScript
- Aliases de path (@/...)
- Interface gráfica disponível

### Cypress

Configurado em `cypress.config.ts`:
- Base URL: http://localhost:5173
- Viewport responsivo
- Screenshots em falhas
- Timeouts configurados

## 🐛 Debugging

### Testes Unitários

```bash
# Debug com console.log
npm run test:watch

# Interface gráfica para debug
npm run test:ui
```

### Testes E2E

```bash
# Modo interativo
npm run test:e2e:open

# Debug com pause()
cy.pause();
```

## 📊 Relatórios

### Cobertura

```bash
npm run test:coverage
```

Gera relatório em `coverage/` com:
- Cobertura por arquivo
- Cobertura por linha
- Relatório HTML interativo

### Cypress

```bash
npm run test:e2e
```

Gera:
- Screenshots de falhas
- Vídeos de execução
- Relatórios de performance

## 🚨 Troubleshooting

### Problemas Comuns

1. **Imports não resolvidos**: Verifique aliases no `vitest.config.ts`
2. **Mocks não funcionando**: Use `vi.mock()` no topo do arquivo
3. **Testes E2E falhando**: Verifique se o servidor está rodando
4. **Timeout em testes**: Ajuste timeouts no `cypress.config.ts`

### Logs e Debug

```bash
# Logs detalhados do Vitest
npm run test -- --reporter=verbose

# Logs do Cypress
DEBUG=cypress:* npm run test:e2e
```

## 📚 Recursos Adicionais

- [Documentação Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Cypress Docs](https://docs.cypress.io/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom) 