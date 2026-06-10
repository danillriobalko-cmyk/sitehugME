import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Тонкая акцентная полоса вверху страницы, показывающая прогресс прокрутки.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100] bg-gradient-to-r from-accent via-purple-400 to-accent shadow-[0_0_10px_rgba(124,58,237,0.6)]"
    />
  );
}
