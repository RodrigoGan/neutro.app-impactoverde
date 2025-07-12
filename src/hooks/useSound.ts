import { useRef, useCallback } from 'react';

type SoundType = 'achievement' | 'levelUp' | 'badge' | 'scheduleConfirmed' | 'avaliarstar' | 'money';

// Sons do Mixkit (gratuitos e sem necessidade de API)
const SOUNDS = {
  achievement: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3',
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
  badge: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3',
  scheduleConfirmed: 'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3', // Usando o mesmo som de levelUp/badge
  avaliarstar: '/sounds/avaliarstar.mp3',
  money: '/sounds/money.mp3', // Usando arquivo local para som de moeda
  // Se o arquivo short_applause.mp3 estiver em public/sounds/, use:
  // scheduleConfirmed: '/sounds/short_applause.mp3'
};

export const useSound = (type: SoundType) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Opcional: reseta para o início
      audioRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    stop(); // Para qualquer som anterior

    try {
      // Criar novo elemento de áudio
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.5;
      
      // Tentar reproduzir
      audio.play().catch(error => {
        console.warn('Erro ao tocar som:', error);
      });

      // Guardar referência
      audioRef.current = audio;

      // Limpar após tocar
      audio.onended = () => {
        audioRef.current = null;
      };

      // Lidar com erros durante o play também
      audio.onerror = () => {
        console.warn('Erro no elemento de áudio ao tocar o som.');
        audioRef.current = null;
      }
    } catch (error) {
      console.warn('Erro ao criar áudio:', error);
    }
  }, [type, stop]);

  return { play, stop };
}; 