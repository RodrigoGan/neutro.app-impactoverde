describe('Autenticação', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve permitir navegar para página de login', () => {
    // Procura por link de login (pode variar dependendo da implementação)
    cy.contains('Entrar').click();
    
    // Verifica se chegou na página de login
    cy.url().should('include', '/login');
  });

  it('deve permitir navegar para página de registro', () => {
    // Procura por link de registro
    cy.contains('Cadastrar').click();
    
    // Verifica se chegou na página de registro
    cy.url().should('include', '/register');
  });

  it('deve validar formulário de login', () => {
    cy.visit('/login');
    
    // Tenta submeter formulário vazio
    cy.get('form').submit();
    
    // Verifica se há mensagens de erro
    cy.get('body').should('contain', 'erro');
  });
}); 