import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '@/hooks/useSound';

interface AchievementSolicitanteRatingProps {
  onComplete?: () => void;
}

const AchievementSolicitanteRating: React.FC<AchievementSolicitanteRatingProps> = ({ onComplete }) => {
  const { play: playSound, stop: stopSound } = useSound('avaliarstar');

  React.useEffect(() => {
    playSound();

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        stopSound();
        onComplete?.();
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => {
      clearInterval(interval);
      stopSound();
    };
  }, [onComplete, playSound, stopSound]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="mb-6"
        >
          <Star className="w-16 h-16 text-yellow-500" />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-neutro mb-2"
        >
          Avaliação Enviada!
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-6"
        >
          Obrigado por avaliar o solicitante. Sua opinião é muito importante!
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <Star className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5
            }}
          >
            <Sparkles className="w-6 h-6 text-blue-400" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AchievementSolicitanteRating; 