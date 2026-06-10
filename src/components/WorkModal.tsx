import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useLang } from '@/hooks/use-lang';
import { useToast } from '@/hooks/use-toast';
import { type Work, type Category, workTitle, workDescription } from '@/lib/types';
import { MediaRenderer } from '@/components/MediaRenderer';
import { LightboxGallery } from '@/components/LightboxGallery';

const categoryLabels: Record<Category, string> = {
  video: 'portfolio.filter.video',
  music: 'portfolio.filter.music',
  game: 'portfolio.filter.games',
  code: 'portfolio.filter.code',
  graphics: 'portfolio.filter.graphics',
  drawing: 'portfolio.filter.drawing',
};

interface WorkModalProps {
  work: Work | null;
  open: boolean;
  onClose: () => void;
}

export function WorkModal({ work, open, onClose }: WorkModalProps) {
  const { t, lang } = useLang();
  const { toast } = useToast();
  const [galleryOpen, setGalleryOpen] = useState(false);

  if (!work || !open) return null;

  const title = workTitle(work, lang);
  const description = workDescription(work, lang);

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/work/${work.id}`;
      await navigator.clipboard.writeText(url);
      toast({
        description: t('share.copied'),
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const showGalleryLightbox = work.media_type === 'gallery' && work.gallery_urls && work.gallery_urls.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border/50 p-0">
          {/* Accessible title/description (visually hidden) */}
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {description || t(categoryLabels[work.category])}
          </DialogDescription>

          <div className="p-6">
            {/* Media Area */}
            <div className="mb-6 rounded-lg overflow-hidden bg-black/40">
              {showGalleryLightbox ? (
                <div
                  className="w-full aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setGalleryOpen(true)}
                >
                  <img
                    src={work.cover_url || ''}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <MediaRenderer work={work} className="w-full" />
              )}
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Title */}
              <h2 className="text-2xl font-bold text-white">{title}</h2>

              {/* Meta Info */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                  {t(categoryLabels[work.category])}
                </Badge>
                {work.year && (
                  <span className="text-sm text-muted-foreground">{work.year}</span>
                )}
              </div>

              {/* Description */}
              {description && (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="gap-2 border-accent/30 text-accent hover:bg-accent/10"
                >
                  <Share2 size={18} />
                  {t('share.btn')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery Lightbox */}
      {showGalleryLightbox && galleryOpen && (
        <LightboxGallery
          images={work.gallery_urls ?? []}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
