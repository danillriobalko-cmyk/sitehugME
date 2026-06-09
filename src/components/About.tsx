import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
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
  { year: 2018, event: 'Started journey' },
  { year: 2020, event: 'First portfolio launch' },
  { year: 2022, event: 'Multi-discipline mastery' },
  { year: 2024, event: 'Full creative studio' },
];

const milestonesRu = [
  { year: 2018, event: 'Начало пути' },
  { year: 2020, event: 'Первый портфолио' },
  { year: 2022, event: 'Мастерство во всех областях' },
  { year: 2024, event: 'Полная творческая студия' },
];

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
              <div className="w-40 h-40 rounded-full bg-secondary flex items-center justify-center">
                <User className="w-20 h-20 text-muted-foreground" />
              </div>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg leading-relaxed text-foreground max-w-xl">
              Мультидисциплинарный творец, объединяющий видеомонтаж, музыку,
              разработку игр, программирование, графический дизайн и
              иллюстрации в единое творческое пространство.
            </p>

            {/* Skills */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                {lang === 'ru' ? 'Навыки' : 'Skills'}
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

            {/* Timeline */}
            <div className="relative space-y-6 pl-6">
              {/* Vertical line */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-accent opacity-30" />

              {currentMilestones.map((milestone, idx) => (
                <div key={idx} className="relative">
                  {/* Dot */}
                  <div className="absolute left-[-11px] top-1 w-3 h-3 rounded-full bg-accent" />
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      {milestone.year}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {milestone.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
