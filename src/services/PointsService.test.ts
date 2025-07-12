import { describe, it, expect, vi } from 'vitest';

// Mock do supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) })
    })
  }
}));

// Funções do serviço de pontos para teste
export const calculatePoints = (kgRecycled: number, materialType: string): number => {
  const basePoints = kgRecycled * 10;
  
  const multipliers = {
    'papel': 1.2,
    'plastico': 1.5,
    'vidro': 1.8,
    'metal': 2.0,
    'eletronico': 3.0,
    'default': 1.0
  };
  
  const multiplier = multipliers[materialType as keyof typeof multipliers] || multipliers.default;
  return Math.round(basePoints * multiplier);
};

export const checkLevelUpgrade = (currentPoints: number, currentLevel: string): { shouldUpgrade: boolean; newLevel: string } => {
  const levels = {
    bronze: { min: 0, max: 999 },
    silver: { min: 1000, max: 4999 },
    gold: { min: 5000, max: Infinity }
  };
  
  let shouldUpgrade = false;
  let newLevel = currentLevel;
  
  if (currentLevel === 'bronze' && currentPoints >= 1000) {
    shouldUpgrade = true;
    newLevel = 'silver';
  } else if (currentLevel === 'silver' && currentPoints >= 5000) {
    shouldUpgrade = true;
    newLevel = 'gold';
  }
  
  return { shouldUpgrade, newLevel };
};

describe('PointsService', () => {
  describe('calculatePoints', () => {
    it('deve calcular pontos base corretamente', () => {
      expect(calculatePoints(5, 'papel')).toBe(60); // 5 * 10 * 1.2 = 60
      expect(calculatePoints(10, 'plastico')).toBe(150); // 10 * 10 * 1.5 = 150
      expect(calculatePoints(2, 'vidro')).toBe(36); // 2 * 10 * 1.8 = 36
    });

    it('deve aplicar multiplicadores corretos por tipo de material', () => {
      expect(calculatePoints(1, 'papel')).toBe(12);
      expect(calculatePoints(1, 'plastico')).toBe(15);
      expect(calculatePoints(1, 'vidro')).toBe(18);
      expect(calculatePoints(1, 'metal')).toBe(20);
      expect(calculatePoints(1, 'eletronico')).toBe(30);
    });

    it('deve usar multiplicador padrão para materiais desconhecidos', () => {
      expect(calculatePoints(10, 'material_desconhecido')).toBe(100); // 10 * 10 * 1.0 = 100
    });
  });

  describe('checkLevelUpgrade', () => {
    it('deve detectar upgrade de bronze para prata', () => {
      const result = checkLevelUpgrade(1000, 'bronze');
      expect(result.shouldUpgrade).toBe(true);
      expect(result.newLevel).toBe('silver');
    });

    it('deve detectar upgrade de prata para ouro', () => {
      const result = checkLevelUpgrade(5000, 'silver');
      expect(result.shouldUpgrade).toBe(true);
      expect(result.newLevel).toBe('gold');
    });

    it('não deve detectar upgrade quando pontos são insuficientes', () => {
      const result = checkLevelUpgrade(500, 'bronze');
      expect(result.shouldUpgrade).toBe(false);
      expect(result.newLevel).toBe('bronze');
    });

    it('não deve detectar upgrade para usuários gold', () => {
      const result = checkLevelUpgrade(10000, 'gold');
      expect(result.shouldUpgrade).toBe(false);
      expect(result.newLevel).toBe('gold');
    });
  });
}); 