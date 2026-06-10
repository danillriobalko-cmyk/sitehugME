import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0A0A0B]"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Pulsing radial glow */}
          <motion.div
            className="absolute w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative flex flex-col items-center gap-5">
            {/* Logo — cinematic letter-spacing reveal */}
            <motion.div
              initial={{ opacity: 0, y: 14, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.02em' }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl sm:text-6xl font-bold text-gradient"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              hugME
            </motion.div>

            {/* Shimmer progress line */}
            <div className="h-[2px] w-44 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent"
                initial={{ x: '-120%' }}
                animate={{ x: '240%' }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
            >
              portfolio
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
