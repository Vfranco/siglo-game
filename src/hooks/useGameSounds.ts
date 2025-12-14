import { useCallback, useRef, useEffect } from 'react';

// URLs de sonidos - Puedes reemplazar estos con tus propios archivos de sonido
const SOUNDS = {
  drawTile: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Chip clink
  win: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Win celebration
  bust: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3', // Error/fail
  stand: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3', // Click
  wildcard: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Power up
  bet: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', // Coins
  coinSelect: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3', // Soft coin click
  backgroundMusic: 'https://assets.mixkit.co/music/preview/mixkit-games-worldbeat-466.mp3', // Upbeat casual game music
};

export const useGameSounds = () => {
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Precargar los sonidos
  useEffect(() => {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      
      // Configuración especial para música de fondo
      if (key === 'backgroundMusic') {
        audio.volume = 0.15; // Volumen más bajo para música de fondo
        audio.loop = true; // Repetir continuamente
      } else {
        audio.volume = 0.5; // Volumen al 50% para efectos de sonido
      }
      
      audioRefs.current[key] = audio;
    });

    // Cleanup
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, []);

  const play = useCallback((soundKey: keyof typeof SOUNDS) => {
    const audio = audioRefs.current[soundKey];
    if (audio) {
      // Reiniciar el sonido si ya está reproduciéndose
      audio.currentTime = 0;
      audio.play().catch(err => {
        // Manejar errores silenciosamente (puede fallar si el usuario no ha interactuado con la página)
        console.debug('Audio play failed:', err);
      });
    }
  }, []);

  const startBackgroundMusic = useCallback(() => {
    const audio = audioRefs.current.backgroundMusic;
    if (audio && audio.paused) {
      audio.play().catch(err => {
        console.debug('Background music play failed:', err);
      });
    }
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    const audio = audioRefs.current.backgroundMusic;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return {
    playDrawTile: () => play('drawTile'),
    playWin: () => play('win'),
    playBust: () => play('bust'),
    playStand: () => play('stand'),
    playWildcard: () => play('wildcard'),
    playBet: () => play('bet'),
    playCoinSelect: () => play('coinSelect'),
    startBackgroundMusic,
    stopBackgroundMusic,
  };
};
