import { Github, Youtube, Music2 } from 'lucide-react';
import { useLang } from '@/hooks/use-lang';

type Social = {
  icon: typeof Github;
  label: string;
  href: string | null;
};

const socials: Social[] = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/danillriobalko-cmyk',
  },
  { icon: Youtube, label: 'YouTube', href: null },
  { icon: Music2, label: 'Music', href: null },
];

const iconClass =
  'w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors';

export function SocialLinks() {
  const { t } = useLang();

  return (
    <div className="flex gap-4">
      {socials.map((social) => {
        const Icon = social.icon;

        // Готовая ссылка (например, GitHub) — открываем в новой вкладке.
        if (social.href) {
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={iconClass}
              aria-label={social.label}
            >
              <Icon className="w-5 h-5" />
            </a>
          );
        }

        // Ещё не готово — показываем плашку «В разработке» при наведении/фокусе.
        return (
          <div key={social.label} className="relative group">
            <button
              type="button"
              className={iconClass}
              aria-label={`${social.label} — ${t('social.dev')}`}
            >
              <Icon className="w-5 h-5" />
            </button>
            <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-secondary px-2 py-1 text-xs text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
              {t('social.dev')}
            </span>
          </div>
        );
      })}
    </div>
  );
}
