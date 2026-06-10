import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLang } from '@/hooks/use-lang';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { supabase } from '@/lib/supabase';
import { type Work, type Category } from '@/lib/types';
import { WorkModal } from '@/components/WorkModal';
import { useEffect } from 'react';

const FILTER_OPTIONS: Array<{ label: string; value: Category | null }> = [
  { label: 'portfolio.filter.all', value: null },
  { label: 'portfolio.filter.video', value: 'video' },
  { label: 'portfolio.filter.music', value: 'music' },
  { label: 'portfolio.filter.games', value: 'game' },
  { label: 'portfolio.filter.code', value: 'code' },
  { label: 'portfolio.filter.graphics', value: 'graphics' },
  { label: 'portfolio.filter.drawing', value: 'drawing' },
];

const categoryLabels: Record<Category, string> = {
  video: 'portfolio.filter.video',
  music: 'portfolio.filter.music',
  game: 'portfolio.filter.games',
  code: 'portfolio.filter.code',
  graphics: 'portfolio.filter.graphics',
  drawing: 'portfolio.filter.drawing',
};

interface WorkCardProps {
  work: Work;
  onOpenModal: (work: Work) => void;
}

function WorkCard({ work, onOpenModal }: WorkCardProps) {
  const { t } = useLang();
  const { ref, isVisible } = useScrollReveal();

  const placeholderGradient = `linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)`;

  return (
    <motion.div
      ref={ref}
      className={`reveal group cursor-pointer h-full ${isVisible ? 'visible' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
      onClick={() => onOpenModal(work)}
    >
      <div className="rounded-lg overflow-hidden bg-card border border-border card-glow h-full flex flex-col transition-transform duration-300 group-hover:scale-[1.02]">
        {/* Media Area */}
        <div className="relative w-full aspect-video overflow-hidden bg-gray-800">
          {work.cover_url ? (
            <img
              src={work.cover_url}
              alt={work.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: placeholderGradient }}
            />
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
              {work.title}
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
                {t(categoryLabels[work.category])}
              </Badge>
              {work.year && (
                <span className="text-xs text-muted-foreground">{work.year}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Portfolio() {
  const { t } = useLang();
  const { ref, isVisible } = useScrollReveal();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function fetchWorks() {
      try {
        const { data, error } = await supabase
          .from('works')
          .select('*')
          .eq('show_on_home', true)
          .order('sort_order');

        if (error) throw error;
        setWorks(data || []);
      } catch (error) {
        console.error('Failed to fetch works:', error);
        setWorks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchWorks();
  }, []);

  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const categoryMatch = selectedCategory === null || work.category === selectedCategory;
      const searchMatch =
        searchQuery === '' ||
        work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (work.description && work.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return categoryMatch && searchMatch;
    });
  }, [works, selectedCategory, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section
      id="portfolio"
      className="relative py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[400px] rounded-full blur-3xl opacity-10"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, #7C3AED, transparent)',
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          ref={ref}
          className={`reveal mb-12 ${isVisible ? 'visible' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {t('nav.portfolio')}
          </h2>
          <div className="w-16 h-1 bg-accent rounded-full" />
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Category Filter */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-2 min-w-min">
              {FILTER_OPTIONS.map((option) => (
                <Button
                  key={option.value ?? 'all'}
                  variant={selectedCategory === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(option.value)}
                  className={`whitespace-nowrap transition-colors ${
                    selectedCategory === option.value
                      ? 'bg-accent text-black hover:bg-accent/90'
                      : 'border-muted-foreground/30 text-muted-foreground hover:text-accent'
                  }`}
                >
                  {t(option.label)}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              type="search"
              name="search"
              autoComplete="off"
              placeholder={t('portfolio.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 text-white placeholder:text-muted-foreground focus-visible:ring-accent"
            />
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-card border border-border/30 h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredWorks.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted-foreground text-lg">{t('portfolio.empty')}</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredWorks.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                onOpenModal={(w) => {
                  setSelectedWork(w);
                  setModalOpen(true);
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <WorkModal
        work={selectedWork}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedWork(null);
        }}
      />
    </section>
  );
}
