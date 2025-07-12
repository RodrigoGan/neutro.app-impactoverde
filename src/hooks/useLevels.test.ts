import { renderHook } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useLevels } from './useLevels';

// Mock do supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'mock error' }) }) })
    })
  }
}));

describe('useLevels', () => {
  it('retorna dados mockados em caso de erro', async () => {
    const { result } = renderHook(() => useLevels('1', 'common'));
    await waitFor(() => {
      expect(result.current.userLevel).toBeTruthy();
      expect(result.current.userLevel?.current_level).toBe('bronze');
      expect(result.current.loading).toBe(false);
    });
  });
}); 