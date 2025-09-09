import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { logger } from '../utils/logger';

interface AudioContextType {
  backgroundMusic: HTMLAudioElement | null;
  isMusicPlaying: boolean;
  musicVolume: number;
  isMuted: boolean;
  toggleMusic: () => void;
  setMusicVolume: (volume: number) => void;
  toggleMute: () => void;
  playSound: (soundPath: string, volume?: number) => void;
  testMusic: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolumeState] = useState(0.2);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const soundEffectsRef = useRef<HTMLAudioElement[]>([]);
  const isInitializedRef = useRef(false);
  const isDestroyedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Kullanıcı etkileşimini dinle
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
        
        // Kullanıcı etkileşimi sonrası müziği başlat
        if (backgroundMusic && !isMusicPlaying && !isMuted) {
          backgroundMusic.play().then(() => {
            setIsMusicPlaying(true);
          }).catch((error: any) => {
            logger.error('🎵 Failed to start music after user interaction:', error);
          });
        }
      }
    };

    // Tüm etkileşim türlerini dinle
    const events = ['click', 'touchstart', 'keydown', 'mousedown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [backgroundMusic, isMusicPlaying, isMuted, hasUserInteracted]);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    isDestroyedRef.current = false;

    // Phaser ile uyumlu olması için gecikme ekle
    const initializeAudio = () => {
      try {
        // HTML5 Audio element oluştur
        const audio = new Audio();
        audio.src = '/journey.mp3';
        audio.loop = true;
        audio.volume = musicVolume;
        audio.preload = 'auto';
        
        // Audio element'i ref'e ve state'e set et
        audioRef.current = audio;
        setBackgroundMusic(audio);
        
        // Audio yükleme hatalarını yakala
        audio.addEventListener('error', (e: Event) => {
          logger.error('🎵 Audio loading error:', e);
          logger.error('🎵 Audio error details:', audio.error);
        });
        
        // Audio event listeners
        audio.addEventListener('play', () => {
          if (!isDestroyedRef.current) {
            setIsMusicPlaying(true);
          }
        });
        audio.addEventListener('pause', () => {
          if (!isDestroyedRef.current) {
            setIsMusicPlaying(false);
          }
        });
        
        // Audio hazır olduğunda volume'u tekrar ayarla
        audio.addEventListener('canplaythrough', () => {
          audio.volume = musicVolume;
        });
        
      } catch (error) {
        logger.error('🎵 Failed to create audio element:', error);
      }
    };

    // Phaser'ın yüklenmesini bekle
    setTimeout(initializeAudio, 2000);

    return () => {
      isDestroyedRef.current = true;
      try {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
        if (audioRef.current) {
          audioRef.current.src = '';
          audioRef.current.load();
        }
      } catch (error) {
        logger.error('🎵 Audio cleanup error:', error);
      }
    };
  }, []);

  useEffect(() => {
    if (backgroundMusic && !isDestroyedRef.current) {
      try {
        backgroundMusic.volume = isMuted ? 0 : musicVolume;
      } catch (error) {
        logger.error('🎵 Volume change error:', error);
      }
    }
  }, [backgroundMusic, isMuted]);

  const toggleMusic = async () => {
    if (isDestroyedRef.current) return;
    
    if (backgroundMusic) {
      try {
        if (isMusicPlaying) {
          backgroundMusic.pause();
          setIsMusicPlaying(false);
        } else {
          // Volume'u kesinlikle ayarla
          backgroundMusic.volume = musicVolume;
          
          // Muted durumunu kontrol et
          if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
          }
          
          // Audio hazır mı kontrol et
          if (backgroundMusic.readyState >= 2) {
            try {
              await backgroundMusic.play();
              setIsMusicPlaying(true);
            } catch (playError: any) {
              logger.error('🎵 Play failed:', playError);
              
              if (playError.name === 'NotAllowedError') {
                alert('🎵 Müzik çalmak için sayfaya tıklayın veya ses butonuna tekrar basın');
              }
            }
          } else {
            // Audio hazır olana kadar bekle
            backgroundMusic.addEventListener('canplaythrough', async () => {
              if (!isDestroyedRef.current) {
                try {
                  await backgroundMusic.play();
                  setIsMusicPlaying(true);
                } catch (error: any) {
                  logger.error('🎵 Failed to start music after loading:', error);
                }
              }
            }, { once: true });
          }
        }
      } catch (error) {
        logger.error('🎵 Failed to toggle music:', error);
        if (isMusicPlaying) {
          setIsMusicPlaying(false);
        }
      }
    }
  };

  const setMusicVolume = (volume: number) => {
    if (isDestroyedRef.current) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMusicVolumeState(clampedVolume);
    if (backgroundMusic && backgroundMusic.readyState >= 2) {
      try {
        backgroundMusic.volume = isMuted ? 0 : clampedVolume;
      } catch (error) {
        logger.error('🎵 Volume set error:', error);
      }
    }
  };

  const toggleMute = () => {
    if (isDestroyedRef.current) return;
    setIsMuted(!isMuted);
  };

  const playSound = (soundPath: string, volume: number = 0.5) => {
    if (isDestroyedRef.current) return;
    
    try {
      const sound = new Audio(soundPath);
      sound.volume = isMuted ? 0 : volume;
      sound.play().catch((error) => {
        logger.warn('🎵 Failed to play sound:', error);
      });
      
      soundEffectsRef.current.push(sound);
      
      sound.addEventListener('ended', () => {
        const index = soundEffectsRef.current.indexOf(sound);
        if (index > -1) {
          soundEffectsRef.current.splice(index, 1);
        }
      });
    } catch (error) {
      logger.warn('🎵 Sound file not found:', soundPath);
    }
  };

  // Test fonksiyonu - müzik dosyasının çalışıp çalışmadığını test et
  const testMusic = () => {
    const testAudio = new Audio('/journey.mp3');
    testAudio.volume = 0.1;
    
    testAudio.addEventListener('canplaythrough', () => {
      testAudio.play().then(() => {
        setTimeout(() => {
          testAudio.pause();
        }, 3000);
      }).catch((error: any) => {
        logger.error('🎵 Test audio failed:', error);
      });
    });
    
    testAudio.addEventListener('error', (e) => {
      logger.error('🎵 Test audio error:', e);
    });
  };

  const value = {
    backgroundMusic,
    isMusicPlaying,
    musicVolume,
    isMuted,
    toggleMusic,
    setMusicVolume,
    toggleMute,
    playSound,
    testMusic
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioContext;
