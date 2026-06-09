import { Github, Youtube, Music2, ArrowUp } from 'lucide-react';
import { useLang } from '@/hooks/use-lang';

const socials = [
  {
    icon: Github,
    label: 'GitHub',
    href: '#',
  },
  {
    icon: Youtube,
    label: 'YouTube',
    href: '#',
  },
  {
    icon: Music2,
    label: 'Music',
    href: '#',
  },
];

export default function Footer() {
  const { t } = useLang();

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="border-t border-border py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Branding & Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="text-lg font-bold text-accent">hugME</h3>
            <p className="text-sm text-muted-foreground">
              © 2026 hugME. {t('footer.rights')}
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            {socials.map((social, idx) => {
              const Icon = social.icon;
              return (
                <a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>

          {/* Back to Top Button */}
          <button
            onClick={handleScrollToTop}
            className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
            aria-label="Back to top"
          >
            <span className="text-sm">{t('footer.up')}</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
