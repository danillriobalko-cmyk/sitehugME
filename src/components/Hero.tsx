import { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/hooks/use-lang';

const ROLES = [
  'hero.role.video',
  'hero.role.music',
  'hero.role.games',
  'hero.role.code',
  'hero.role.design',
  'hero.role.drawing',
];

const ROLE_CYCLE_INTERVAL = 2500; // 2.5 seconds

export default function Hero(): JSX.Element {
  const { t } = useLang();
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, ROLE_CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const roleVariants: Variants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20"
    >
      {/* Background Gradient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, #7C3AED, transparent)',
          }}
        />
      </div>

      {/* Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Content */}
      <motion.div
        className="container mx-auto px-4 relative z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-7xl md:text-8xl font-bold text-accent font-space-grotesk mb-6 leading-tight"
        >
          hugME
        </motion.h1>

        {/* Rotating Roles */}
        <motion.div variants={itemVariants} className="h-16 sm:h-20 md:h-24 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentRoleIndex}
              variants={roleVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.6,
                ease: 'easeInOut',
              }}
              className="text-xl sm:text-2xl md:text-3xl text-foreground font-space-grotesk"
            >
              {t(ROLES[currentRoleIndex])}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Tagline */}
        <motion.p variants={itemVariants} className="text-muted-foreground text-base sm:text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          {t('hero.tagline')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => scrollToSection('portfolio')}
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 flex items-center justify-center gap-2"
          >
            {t('hero.cta.works')}
            <ArrowRight size={18} />
          </Button>
          <Button
            onClick={() => scrollToSection('contacts')}
            size="lg"
            variant="outline"
            className="border border-border hover:border-accent text-foreground hover:text-accent"
          >
            {t('hero.cta.contact')}
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1 h-2 bg-accent rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
