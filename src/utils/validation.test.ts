import { describe, it, expect } from 'vitest';

// Funções de validação simples para teste
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

describe('Validações', () => {
  describe('validateEmail', () => {
    it('deve validar emails corretos', () => {
      expect(validateEmail('teste@exemplo.com')).toBe(true);
      expect(validateEmail('usuario@dominio.org')).toBe(true);
      expect(validateEmail('nome.sobrenome@empresa.com.br')).toBe(true);
    });

    it('deve rejeitar emails incorretos', () => {
      expect(validateEmail('email-invalido')).toBe(false);
      expect(validateEmail('@dominio.com')).toBe(false);
      expect(validateEmail('usuario@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPFs corretos', () => {
      expect(validateCPF('123.456.789-09')).toBe(true);
      expect(validateCPF('11144477735')).toBe(true);
    });

    it('deve rejeitar CPFs incorretos', () => {
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('123.456.789-10')).toBe(false);
      expect(validateCPF('123456789')).toBe(false);
      expect(validateCPF('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('deve validar telefones corretos', () => {
      expect(validatePhone('(11) 99999-9999')).toBe(true);
      expect(validatePhone('11999999999')).toBe(true);
      expect(validatePhone('(11) 3333-3333')).toBe(true);
    });

    it('deve rejeitar telefones incorretos', () => {
      expect(validatePhone('123')).toBe(false);
      expect(validatePhone('(11) 999-999')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });
}); 