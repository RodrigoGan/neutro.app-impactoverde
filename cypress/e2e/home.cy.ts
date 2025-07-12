describe('Página Inicial', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve carregar a página inicial corretamente', () => {
    // Verifica se a página carrega
    cy.get('body').should('be.visible');
    
    // Verifica se elementos principais estão presentes
    cy.contains('Neutro').should('be.visible');
  });

  it('deve ter navegação funcional', () => {
    // Verifica se o header está presente
    cy.get('header').should('be.visible');
    
    // Verifica se há links de navegação
    cy.get('nav').should('be.visible');
  });

  it('deve ser responsivo', () => {
    // Testa em desktop
    cy.viewport(1280, 720);
    cy.get('body').should('be.visible');
    
    // Testa em mobile
    cy.viewport(375, 667);
    cy.get('body').should('be.visible');
  });
}); 