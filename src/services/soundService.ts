import { useEffect, useState } from 'react';

// Sons gratuitos do Pixabay
const SOUNDS = {
  // Som de conquista - aplausos e celebração
  achievement: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=success-1-6297.mp3',
  
  // Som de subida de nível - efeito de power up
  levelUp: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=power-up-1-6297.mp3',
  
  // Som de desbloqueio de badge - efeito de unlock
  badge: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=unlock-1-6297.mp3'
};

export const useSoundService = () => {
  const [sounds] = useState<Record<string, string>>(SOUNDS);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { sounds, loading, error };
}; 