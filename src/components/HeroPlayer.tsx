import { useEffect, useRef } from 'react';
import { useRadioStore, getEnvColorVar } from '@/stores/useRadioStore';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';

import envSertanejo from '@/assets/env-sertanejo.jpg';
import envPoprock from '@/assets/env-poprock.jpg';
import envRaiz from '@/assets/env-raiz.jpg';
import envGospel from '@/assets/env-gospel.jpg';

const localImageMap: Record<string, string> = {
  sertanejo: envSertanejo,
  poprock: envPoprock,
  raiz: envRaiz,
  gospel: envGospel,
};

const glowMap: Record<string, string> = {
  sertanejo: 'shadow-[0_8px_80px_-12px_hsl(var(--env-sertanejo)/0.35)]',
  poprock: 'shadow-[0_8px_80px_-12px_hsl(var(--env-poprock)/0.35)]',
  raiz: 'shadow-[0_8px_80px_-12px_hsl(var(--env-raiz)/0.35)]',
  gospel: 'shadow-[0_8px_80px_-12px_hsl(var(--env-gospel)/0.35)]',
};

const HeroPlayer = () => {
  const {
    isPlaying, togglePlay, setPlaying, volume, setVolume,
    currentEnvironmentSlug, currentTrack,
    getCurrentEnvironment, getCurrentStreamUrl,
    loadEnvironments, environmentsLoaded,
  } = useRadioStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!environmentsLoaded) loadEnvironments();
  }, [environmentsLoaded, loadEnvironments]);

  const env = getCurrentEnvironment();
  const streamUrl = getCurrentStreamUrl();
  const imgSrc = env?.image_url || localImageMap[env?.slug || 'sertanejo'] || localImageMap.sertanejo;
  const glow = glowMap[env?.slug || 'sertanejo'] || '';

  // Setup HLS audio
  useEffect(() => {
    if (!streamUrl) return;

    // Create audio element if needed
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    // Cleanup previous HLS
    hlsRef.current?.destroy();
    hlsRef.current = null;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) audio.play().catch(() => {});
      });
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = streamUrl;
      if (isPlaying) audio.play().catch(() => {});
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [streamUrl]);

  // Play/pause sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, streamUrl]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <motion.div
      layout
      className={`relative overflow-hidden rounded-3xl ${glow} transition-shadow duration-500`}
      style={{ height: '65vh', minHeight: 360, maxHeight: 600 }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentEnvironmentSlug}
          src={imgSrc}
          alt={env?.label || 'Rádio TVG'}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-7">
        {/* Visualizer bars */}
        <div className="flex items-end justify-center gap-[3px] h-10 mb-6 opacity-80">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-[3px] rounded-full bg-white/70"
              animate={{
                height: isPlaying ? [4, 14 + Math.random() * 20, 8, 22 + Math.random() * 12, 4] : 3,
              }}
              transition={{
                duration: 1.2 + Math.random() * 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.04,
              }}
            />
          ))}
        </div>

        {/* Track info */}
        <div className="text-center mb-5">
          <p className="text-white/50 text-xs font-medium uppercase tracking-[0.15em] mb-1">
            {env?.label || 'Rádio TVG'}
          </p>
          <p className="text-white text-xl font-display font-bold leading-tight">
            {currentTrack.title}
          </p>
          <p className="text-white/60 text-sm mt-1">{currentTrack.artist}</p>
          {!streamUrl && (
            <p className="text-white/30 text-[10px] mt-2">Stream não configurado</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
            className="p-2 text-white/50 hover:text-white transition-colors duration-200"
          >
            {volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            disabled={!streamUrl}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 disabled:opacity-40"
          >
            {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
          </motion.button>

          <div className="w-20">
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-[3px] rounded-full appearance-none bg-white/20 cursor-pointer accent-white"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroPlayer;
