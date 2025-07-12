import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { userLevels } from '@/components/levels/levelsData';

export interface UserLevel {
  id: string;
  user_id: string;
  user_type: 'common' | 'collector' | 'cooperative' | 'partner';
  current_level: 'bronze' | 'silver' | 'gold';
  current_points: number;
  total_points: number;
  collections_count?: number;
  kg_recycled?: number;
  ratings_count?: number;
  active_coupons?: number;
  sales_count?: number;
  months_active: number;
  created_at: string;
  updated_at: string;
}

export interface LevelProgress {
  currentLevel: 'bronze' | 'silver' | 'gold';
  currentPoints: number;
  nextLevelPoints: number;
  progress: number;
  requirements: {
    collections?: number;
    kg?: number;
    ratings?: number;
    activeCoupons?: number;
    sales?: number;
    months: number;
  };
  currentRequirements: {
    collections?: number;
    kg?: number;
    ratings?: number;
    activeCoupons?: number;
    sales?: number;
    months: number;
  };
}

export const useLevels = (userId?: string, userType: string = 'common') => {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchUserLevel() {
      setLoading(true);
      setError(null);
      try {
        if (userId) {
          const { data, error } = await supabase
            .from('user_levels')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (!ignore && !error && data) {
            setUserLevel(data);
            
            // Calcula progresso do nível
            const levelData = userLevels[userType as keyof typeof userLevels];
            const currentLevelData = levelData[data.current_level];
            const nextLevel = data.current_level === 'bronze' ? 'silver' : 
                             data.current_level === 'silver' ? 'gold' : null;
            const nextLevelData = nextLevel ? levelData[nextLevel] : null;
            
            const progress: LevelProgress = {
              currentLevel: data.current_level,
              currentPoints: data.current_points,
              nextLevelPoints: nextLevelData?.requirements.points || 0,
              progress: nextLevelData ? 
                Math.min(100, (data.current_points / nextLevelData.requirements.points) * 100) : 100,
              requirements: currentLevelData?.requirements || {},
              currentRequirements: {
                collections: data.collections_count || 0,
                kg: data.kg_recycled || 0,
                ratings: data.ratings_count || 0,
                activeCoupons: data.active_coupons || 0,
                sales: data.sales_count || 0,
                months: data.months_active
              }
            };
            setLevelProgress(progress);
          } else {
            // Fallback para dados mockados
            setUserLevel({
              id: '1',
              user_id: userId,
              user_type: userType as any,
              current_level: 'bronze',
              current_points: 150,
              total_points: 150,
              collections_count: 8,
              kg_recycled: 25,
              ratings_count: 6,
              months_active: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (err) {
        setError('Erro ao carregar nível do usuário');
        // Fallback para dados mockados em caso de erro
        setUserLevel({
          id: '1',
          user_id: userId || '1',
          user_type: userType as any,
          current_level: 'bronze',
          current_points: 150,
          total_points: 150,
          collections_count: 8,
          kg_recycled: 25,
          ratings_count: 6,
          months_active: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } finally {
        setLoading(false);
      }
    }
    fetchUserLevel();
    return () => { ignore = true; };
  }, [userId, userType]);

  return { userLevel, levelProgress, loading, error };
}; 