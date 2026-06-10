import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLang } from '@/hooks/use-lang';
import { cn } from '@/lib/utils';

type NavLink = {
  label: string;
  id: string;
};

export default function Header(): JSX.Element {
  const { lang, setLang, t } = useLang();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navLinks: NavLink[] = [
    { label: t('nav.home'), id: 'home' },
    { label: t('nav.portfolio'), id: 'portfolio' },
    { label: t('nav.about'), id: 'about' },
    { label: t('nav.contacts'), id: 'contacts' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleLangToggle = () => {
    setLang(lang === 'ru' ? 'en' : 'ru');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled && 'bg-background/80 backdrop-blur-lg border-b border-border'
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollToSection('home')}
          className="font-bold text-2xl text-accent font-space-grotesk cursor-pointer hover:opacity-80 transition-opacity"
        >
          hugME
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="relative text-foreground hover:text-accent transition-colors duration-200 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Side - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLangToggle}
            className="px-3 py-1 rounded-md text-sm font-medium border border-border hover:border-accent text-foreground hover:text-accent transition-colors"
          >
            {lang === 'ru' ? 'EN' : 'RU'}
          </button>
          <Button
            onClick={() => scrollToSection('contacts')}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {t('nav.contact_btn')}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X size={24} className="text-accent" />
          ) : (
            <Menu size={24} className="text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background border-t border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-foreground hover:text-accent transition-colors text-left py-2"
                >
                  {link.label}
                </button>
              ))}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={handleLangToggle}
                  className="flex-1 px-3 py-2 rounded-md text-sm font-medium border border-border hover:border-accent text-foreground hover:text-accent transition-colors"
                >
                  {lang === 'ru' ? 'EN' : 'RU'}
                </button>
                <Button
                  onClick={() => scrollToSection('contacts')}
                  className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {t('nav.contact_btn')}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
