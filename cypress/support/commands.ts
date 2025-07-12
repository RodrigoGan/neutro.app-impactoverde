// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Comando customizado para login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('form').submit();
});

// Comando customizado para logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  // Ou navegar para logout se não houver botão específico
  cy.visit('/logout');
});

// Comando customizado para verificar se está logado
Cypress.Commands.add('isLoggedIn', () => {
  // Verifica se há elementos que indicam que o usuário está logado
  return cy.get('body').then(($body) => {
    return $body.find('[data-testid="user-menu"]').length > 0;
  });
});

// Comando para aguardar carregamento da página
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-testid="loading"]').should('not.exist');
});

// Comando para limpar dados de teste
Cypress.Commands.add('clearTestData', () => {
  // Limpa localStorage
  cy.clearLocalStorage();
  // Limpa sessionStorage
  cy.clearAllSessionStorage();
  // Limpa cookies
  cy.clearCookies();
}); 