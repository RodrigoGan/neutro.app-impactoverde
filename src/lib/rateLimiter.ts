import React from 'react';
import log from './logger';

// Interface para configuração de rate limit
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (identifier: string) => string;
}

// Interface para resultado de rate limit
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Armazenamento em memória para rate limiting
const rateLimitStore = new Map<string, {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}>();

// Configurações padrão de rate limit
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // Login - 5 tentativas por 15 minutos
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    keyGenerator: (identifier: string) => `login:${identifier}`
  },
  
  // Registro - 3 tentativas por hora
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    keyGenerator: (identifier: string) => `register:${identifier}`
  },
  
  // API geral - 100 requests por minuto
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
    keyGenerator: (identifier: string) => `api:${identifier}`
  },
  
  // Upload de arquivos - 10 por hora
  upload: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
    keyGenerator: (identifier: string) => `upload:${identifier}`
  },
  
  // Validação de cupons - 50 por minuto
  coupon_validation: {
    maxRequests: 50,
    windowMs: 60 * 1000, // 1 minuto
    keyGenerator: (identifier: string) => `coupon:${identifier}`
  },
  
  // Criação de coletas - 20 por hora
  collection_create: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hora
    keyGenerator: (identifier: string) => `collection:${identifier}`
  }
};

/**
 * Verifica se uma requisição está dentro do rate limit
 */
export function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMIT_CONFIGS = 'api'
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[type];
  const key = config.keyGenerator ? config.keyGenerator(identifier) : `${type}:${identifier}`;
  const now = Date.now();
  
  // Limpar dados expirados
  cleanupExpiredEntries();
  
  const entry = rateLimitStore.get(key);
  
  // Se não há entrada, criar uma nova
  if (!entry) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime
    };
  }
  
  // Se está bloqueado
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
    };
  }
  
  // Se a janela expirou, resetar
  if (now > entry.resetTime) {
    const newResetTime = now + config.windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime: newResetTime
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newResetTime
    };
  }
  
  // Incrementar contador
  entry.count++;
  
  // Verificar se excedeu o limite
  if (entry.count > config.maxRequests) {
    // Bloquear por 1 hora se excedeu o limite
    const blockDuration = 60 * 60 * 1000; // 1 hora
    entry.blockedUntil = now + blockDuration;
    
    log.warn('⚠️ [RateLimiter] Rate limit excedido:', {
      identifier,
      type,
      count: entry.count,
      maxRequests: config.maxRequests,
      blockedUntil: new Date(entry.blockedUntil).toISOString()
    });
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil(blockDuration / 1000)
    };
  }
  
  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime
  };
}

/**
 * Limpa entradas expiradas do store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remover se a janela expirou e não está bloqueado
    if (now > entry.resetTime && (!entry.blockedUntil || now > entry.blockedUntil)) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Middleware para rate limiting em funções
 */
export function withRateLimit<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  type: keyof typeof RATE_LIMIT_CONFIGS = 'api',
  identifierGenerator?: (...args: T) => string
) {
  return async (...args: T): Promise<R> => {
    const identifier = identifierGenerator ? identifierGenerator(...args) : 'default';
    const result = checkRateLimit(identifier, type);
    
    if (!result.allowed) {
      throw new Error(`Rate limit excedido. Tente novamente em ${result.retryAfter} segundos.`);
    }
    
    return fn(...args);
  };
}

/**
 * Hook para rate limiting em componentes React
 */
export function useRateLimit(
  type: keyof typeof RATE_LIMIT_CONFIGS = 'api',
  identifier: string
) {
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [remaining, setRemaining] = React.useState(0);
  const [retryAfter, setRetryAfter] = React.useState<number | undefined>();
  
  const checkLimit = React.useCallback(() => {
    const result = checkRateLimit(identifier, type);
    setIsBlocked(!result.allowed);
    setRemaining(result.remaining);
    setRetryAfter(result.retryAfter);
    return result;
  }, [identifier, type]);
  
  const executeWithLimit = React.useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T> => {
    const result = checkLimit();
    
    if (!result.allowed) {
      throw new Error(`Rate limit excedido. Tente novamente em ${result.retryAfter} segundos.`);
    }
    
    return fn();
  }, [checkLimit]);
  
  React.useEffect(() => {
    checkLimit();
    
    // Verificar periodicamente se ainda está bloqueado
    if (isBlocked && retryAfter) {
      const timer = setTimeout(() => {
        checkLimit();
      }, retryAfter * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isBlocked, retryAfter, checkLimit]);
  
  return {
    isBlocked,
    remaining,
    retryAfter,
    checkLimit,
    executeWithLimit
  };
}

/**
 * Rate limiter específico para login
 */
export function checkLoginRateLimit(identifier: string): RateLimitResult {
  return checkRateLimit(identifier, 'login');
}

/**
 * Rate limiter específico para registro
 */
export function checkRegisterRateLimit(identifier: string): RateLimitResult {
  return checkRateLimit(identifier, 'register');
}

/**
 * Rate limiter específico para criação de coletas
 */
export function checkCollectionRateLimit(identifier: string): RateLimitResult {
  return checkRateLimit(identifier, 'collection_create');
}

/**
 * Rate limiter específico para validação de cupons
 */
export function checkCouponRateLimit(identifier: string): RateLimitResult {
  return checkRateLimit(identifier, 'coupon_validation');
}

/**
 * Obtém estatísticas de rate limiting
 */
export function getRateLimitStats(): {
  totalEntries: number;
  blockedEntries: number;
  activeEntries: number;
} {
  let blockedCount = 0;
  let activeCount = 0;
  
  for (const entry of rateLimitStore.values()) {
    if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
      blockedCount++;
    } else {
      activeCount++;
    }
  }
  
  return {
    totalEntries: rateLimitStore.size,
    blockedEntries: blockedCount,
    activeEntries: activeCount
  };
}

/**
 * Limpa todos os dados de rate limiting (útil para testes)
 */
export function clearRateLimitStore(): void {
  rateLimitStore.clear();
  log.info('✅ [RateLimiter] Store de rate limiting limpo');
} 