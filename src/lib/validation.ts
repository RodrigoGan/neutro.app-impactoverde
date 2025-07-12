import log from './logger';

// Tipos de validação
export type ValidationRule = {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
};

// Padrões de validação
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cep: /^\d{5}-\d{3}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
};

// Regras de validação pré-definidas
export const VALIDATION_RULES = {
  email: [
    { type: 'required' as const, message: 'E-mail é obrigatório' },
    { type: 'email' as const, message: 'E-mail inválido' }
  ],
  password: [
    { type: 'required' as const, message: 'Senha é obrigatória' },
    { type: 'minLength' as const, value: 6, message: 'Senha deve ter no mínimo 6 caracteres' },
    { type: 'pattern' as const, value: VALIDATION_PATTERNS.password, message: 'Senha deve conter letra maiúscula, minúscula, número e caractere especial' }
  ],
  name: [
    { type: 'required' as const, message: 'Nome é obrigatório' },
    { type: 'minLength' as const, value: 2, message: 'Nome deve ter no mínimo 2 caracteres' },
    { type: 'maxLength' as const, value: 100, message: 'Nome deve ter no máximo 100 caracteres' },
    { type: 'pattern' as const, value: VALIDATION_PATTERNS.onlyLetters, message: 'Nome deve conter apenas letras' }
  ],
  phone: [
    { type: 'required' as const, message: 'Telefone é obrigatório' },
    { type: 'pattern' as const, value: VALIDATION_PATTERNS.phone, message: 'Telefone deve estar no formato (11) 99999-9999' }
  ],
  cpf: [
    { type: 'required' as const, message: 'CPF é obrigatório' },
    { type: 'pattern' as const, value: VALIDATION_PATTERNS.cpf, message: 'CPF deve estar no formato 000.000.000-00' },
    { type: 'custom' as const, validator: validateCPF, message: 'CPF inválido' }
  ],
  cnpj: [
    { type: 'required' as const, message: 'CNPJ é obrigatório' },
    { type: 'pattern' as const, value: VALIDATION_PATTERNS.cnpj, message: 'CNPJ deve estar no formato 00.000.000/0000-00' },
    { type: 'custom' as const, validator: validateCNPJ, message: 'CNPJ inválido' }
  ],
  cep: [
    { type: 'required' as const, message: 'CEP é obrigatório' },
    { type: 'pattern' as const, value: VALIDATION_PATTERNS.cep, message: 'CEP deve estar no formato 00000-000' }
  ],
  address: [
    { type: 'required' as const, message: 'Endereço é obrigatório' },
    { type: 'minLength' as const, value: 5, message: 'Endereço deve ter no mínimo 5 caracteres' },
    { type: 'maxLength' as const, value: 200, message: 'Endereço deve ter no máximo 200 caracteres' }
  ],
  number: [
    { type: 'required' as const, message: 'Número é obrigatório' },
    { type: 'pattern' as const, value: VALIDATION_PATTERNS.onlyNumbers, message: 'Número deve conter apenas dígitos' }
  ]
};

// Interface para resultado de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

/**
 * Valida um valor contra uma lista de regras
 */
export function validateValue(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  let sanitizedValue = value;

  for (const rule of rules) {
    const isValid = validateRule(value, rule);
    
    if (!isValid) {
      errors.push(rule.message);
    }
  }

  // Sanitizar valor se não houver erros
  if (errors.length === 0) {
    sanitizedValue = sanitizeValue(value);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue
  };
}

/**
 * Valida uma regra específica
 */
function validateRule(value: any, rule: ValidationRule): boolean {
  switch (rule.type) {
    case 'required':
      return value !== null && value !== undefined && value !== '';
    
    case 'email':
      return VALIDATION_PATTERNS.email.test(value);
    
    case 'minLength':
      return value && value.length >= rule.value;
    
    case 'maxLength':
      return value && value.length <= rule.value;
    
    case 'pattern':
      return rule.value.test(value);
    
    case 'custom':
      return rule.validator ? rule.validator(value) : true;
    
    default:
      return true;
  }
}

/**
 * Sanitiza um valor para remover caracteres perigosos
 */
function sanitizeValue(value: any): any {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Valida CPF
 */
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;
  
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
}

/**
 * Valida CNPJ
 */
function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }
  
  // Validação dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) {
    return false;
  }
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) {
    return false;
  }
  
  return true;
}

/**
 * Valida um objeto completo
 */
export function validateObject(obj: Record<string, any>, schema: Record<string, ValidationRule[]>): ValidationResult {
  const errors: string[] = [];
  const sanitizedObj: Record<string, any> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];
    const result = validateValue(value, rules);
    
    if (!result.isValid) {
      errors.push(...result.errors.map(error => `${field}: ${error}`));
    } else {
      sanitizedObj[field] = result.sanitizedValue;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedObj
  };
}

/**
 * Valida dados de registro de usuário
 */
export function validateUserRegistration(data: any): ValidationResult {
  const schema = {
    name: VALIDATION_RULES.name,
    email: VALIDATION_RULES.email,
    password: VALIDATION_RULES.password,
    phone: VALIDATION_RULES.phone,
    document: data.userType === 'individual_collector' ? VALIDATION_RULES.cpf : VALIDATION_RULES.cnpj,
    cep: VALIDATION_RULES.cep,
    address: VALIDATION_RULES.address,
    number: VALIDATION_RULES.number
  };

  return validateObject(data, schema);
}

/**
 * Valida dados de login
 */
export function validateLogin(data: any): ValidationResult {
  const schema = {
    email: VALIDATION_RULES.email,
    password: [
      { type: 'required' as const, message: 'Senha é obrigatória' }
    ]
  };

  return validateObject(data, schema);
}

/**
 * Valida dados de coleta
 */
export function validateCollection(data: any): ValidationResult {
  const schema = {
    materials: [
      { type: 'required' as const, message: 'Materiais são obrigatórios' },
      { type: 'custom' as const, validator: (value: any) => Array.isArray(value) && value.length > 0, message: 'Pelo menos um material deve ser selecionado' }
    ],
    quantity: [
      { type: 'required' as const, message: 'Quantidade é obrigatória' },
      { type: 'custom' as const, validator: (value: any) => value > 0, message: 'Quantidade deve ser maior que zero' }
    ],
    observations: [
      { type: 'maxLength' as const, value: 500, message: 'Observações devem ter no máximo 500 caracteres' }
    ]
  };

  return validateObject(data, schema);
}

/**
 * Valida dados de cupom
 */
export function validateCoupon(data: any): ValidationResult {
  const schema = {
    title: [
      { type: 'required' as const, message: 'Título é obrigatório' },
      { type: 'minLength' as const, value: 3, message: 'Título deve ter no mínimo 3 caracteres' },
      { type: 'maxLength' as const, value: 100, message: 'Título deve ter no máximo 100 caracteres' }
    ],
    discount_value: [
      { type: 'required' as const, message: 'Valor do desconto é obrigatório' },
      { type: 'custom' as const, validator: (value: any) => value > 0, message: 'Valor do desconto deve ser maior que zero' }
    ],
    valid_until: [
      { type: 'required' as const, message: 'Data de validade é obrigatória' },
      { type: 'custom' as const, validator: (value: any) => new Date(value) > new Date(), message: 'Data de validade deve ser futura' }
    ]
  };

  return validateObject(data, schema);
}

/**
 * Log de tentativas de validação suspeitas
 */
export function logValidationAttempt(field: string, value: any, isValid: boolean): void {
  if (!isValid) {
    log.warn('⚠️ [Validation] Tentativa de validação suspeita:', {
      field,
      value: typeof value === 'string' ? value.substring(0, 50) : value,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Rate limiting para validações
 */
const validationAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const attempts = validationAttempts.get(identifier);

  if (!attempts || now - attempts.lastAttempt > windowMs) {
    validationAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  if (attempts.count >= maxAttempts) {
    log.warn('⚠️ [Validation] Rate limit excedido:', { identifier, attempts: attempts.count });
    return false;
  }

  attempts.count++;
  attempts.lastAttempt = now;
  return true;
} 