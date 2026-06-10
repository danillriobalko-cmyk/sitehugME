import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/hooks/use-lang';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { supabase } from '@/lib/supabase';
import { type Work, workTitle, workDescription } from '@/lib/types';
import { MediaRenderer } from '@/components/MediaRenderer';
import { cn } from '@/lib/utils';

export function Premiere(): JSX.Element | null {
  const { t, lang } = useLang();
  const { ref, isVisible } = useScrollReveal(0.1);
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedWork = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('works')
          .select('*')
          .eq('is_featured', true)
          .order('sort_order')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching featured work:', error);
          return;
        }

        setWork(data);
      } catch (err) {
        console.error('Error fetching featured work:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedWork();
  }, []);

  if (loading || !work) {
    return null;
  }

  return (
    <section id="premiere" className="relative py-20">
      {/* Accent glow background */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          className={cn('reveal', isVisible && 'visible')}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm font-medium text-accent uppercase tracking-wider">
              {t('premiere.label')}
            </span>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            {/* Media - Left side (60% on desktop) */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full h-full min-h-96 rounded-lg overflow-hidden shadow-2xl"
              >
                <MediaRenderer work={work} className="w-full h-full" />
              </motion.div>
            </div>

            {/* Details - Right side (40% on desktop) */}
            <div className="lg:col-span-2 flex flex-col justify-between">
              <div>
                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-3xl lg:text-4xl font-bold text-white mb-4"
                >
                  {workTitle(work, lang)}
                </motion.h2>

                {/* Category and Year */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-wrap items-center gap-3 mb-4"
                >
                  <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium uppercase">
                    {work.category}
                  </span>
                  {work.year && (
                    <span className="text-muted-foreground text-sm">
                      {work.year}
                    </span>
                  )}
                </motion.div>

                {/* Description */}
                {workDescription(work, lang) && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-foreground leading-relaxed mb-6"
                  >
                    {workDescription(work, lang)}
                  </motion.p>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
