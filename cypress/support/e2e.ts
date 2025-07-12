// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configurações globais
Cypress.on('uncaught:exception', (err, runnable) => {
  // Retorna false para evitar que o Cypress falhe em erros não capturados
  // Útil para aplicações React que podem ter erros de desenvolvimento
  return false;
});

// Comandos customizados
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Comando customizado para login
       */
      login(email: string, password: string): Chainable<void>;
      
      /**
       * Comando customizado para logout
       */
      logout(): Chainable<void>;
      
      /**
       * Comando customizado para verificar se está logado
       */
      isLoggedIn(): Chainable<boolean>;
      
      /**
       * Comando customizado para limpar dados de teste
       */
      clearTestData(): Chainable<void>;
    }
  }
} 