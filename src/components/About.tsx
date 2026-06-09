import { useEffect, useState, type MouseEvent } from 'react';
import { useLang } from '@/hooks/use-lang';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { useCounter } from '@/hooks/use-counter';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface StatCounts {
  video: number;
  music: number;
  game: number;
  total: number;
}

const skills = [
  'Video Editing',
  'Music Production',
  'Game Dev',
  'Programming',
  'Graphic Design',
  'Illustration',
];

const skillsRu = [
  'Видеомонтаж',
  'Музыка',
  'Разработка игр',
  'Программирование',
  'Графический дизайн',
  'Иллюстрация',
];

const milestones = [
  { year: 2018, event: 'Started the journey' },
  { year: 2020, event: 'First portfolio launch' },
  { year: 2022, event: 'Multi-discipline mastery' },
  { year: 2024, event: 'Full creative studio' },
  { year: 2025, event: 'New portfolio website' },
  { year: 2026, event: 'Growth & new projects' },
];

const milestonesRu = [
  { year: 2018, event: 'Начало пути' },
  { year: 2020, event: 'Первое портфолио' },
  { year: 2022, event: 'Мастерство во всех областях' },
  { year: 2024, event: 'Полноценная творческая студия' },
  { year: 2025, event: 'Новый сайт-портфолио' },
  { year: 2026, event: 'Развитие и новые проекты' },
];

function MilestoneCard({ year, event }: { year: number; event: string }) {
  const [transform, setTransform] = useState(
    'perspective(800px) rotateX(0deg) rotateY(0deg)'
  );

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(800px) rotateX(${(-py * 14).toFixed(2)}deg) rotateY(${(
        px * 14
      ).toFixed(2)}deg) translateZ(6px)`
    );
  };

  const reset = () =>
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg)');

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        transition:
          'transform .12s ease-out, box-shadow .2s ease, border-color .2s ease',
      }}
      className="group relative rounded-xl border border-border bg-secondary/40 p-5 hover:border-accent/60 hover:shadow-[0_14px_40px_-12px_rgba(124,58,237,0.5)]"
    >
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative" style={{ transform: 'translateZ(24px)' }}>
        <span className="text-2xl font-bold text-accent">{year}</span>
        <p className="mt-1.5 text-sm text-muted-foreground">{event}</p>
      </div>
    </div>
  );
}

export default function About() {
  const { t, lang } = useLang();
  const { ref, isVisible } = useScrollReveal(0.2);
  const [counts, setCounts] = useState<StatCounts>({
    video: 0,
    music: 0,
    game: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const videoCounter = useCounter(counts.video, 1500, false);
  const musicCounter = useCounter(counts.music, 1500, false);
  const gameCounter = useCounter(counts.game, 1500, false);
  const totalCounter = useCounter(counts.total, 1500, false);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const { data, error } = await supabase.from('works').select('category');
        if (error) throw error;

        const categoryCounts = {
          video: 0,
          music: 0,
          game: 0,
          total: data?.length || 0,
        };

        data?.forEach((work: any) => {
          if (work.category === 'video') categoryCounts.video++;
          else if (work.category === 'music') categoryCounts.music++;
          else if (work.category === 'game') categoryCounts.game++;
        });

        setCounts(categoryCounts);
      } catch (err) {
        console.error('Failed to fetch works:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    if (isVisible) {
      videoCounter.start();
      musicCounter.start();
      gameCounter.start();
      totalCounter.start();
    }
  }, [isVisible]);

  const currentSkills = lang === 'ru' ? skillsRu : skills;
  const currentMilestones = lang === 'ru' ? milestonesRu : milestones;

  return (
    <section
      id="about"
      ref={ref}
      className={`reveal py-20 px-4 md:px-8 transition-all duration-700 ${
        isVisible ? 'visible' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">
          {t('about.title')}
        </h2>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Avatar, Description, Skills */}
          <div className="space-y-8">
            {/* Avatar */}
            <div className="flex justify-center lg:justify-start">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-secondary border border-border">
                <img
                  src="/avatar.png"
                  alt="hugME"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg leading-relaxed text-foreground max-w-xl">
              {t('about.description')}
            </p>

            {/* Skills */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                {t('about.skills')}
              </h3>
              <div className="flex flex-wrap gap-3">
                {currentSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Timeline */}
          <div className="space-y-12">
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">
                  {isLoading ? '—' : videoCounter.count}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('about.stats.video')}
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">
                  {isLoading ? '—' : musicCounter.count}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('about.stats.tracks')}
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">
                  {isLoading ? '—' : gameCounter.count}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('about.stats.games')}
                </p>
              </div>

              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">
                  {isLoading ? '—' : totalCounter.count}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('about.stats.projects')}
                </p>
              </div>
            </div>

            {/* Timeline — 3D cards */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                {t('about.journey')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {currentMilestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.year}
                    year={milestone.year}
                    event={milestone.event}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
