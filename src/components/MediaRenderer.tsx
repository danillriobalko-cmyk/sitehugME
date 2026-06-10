import { ExternalLink, Github } from 'lucide-react';
import { type Work } from '@/lib/types';

export interface MediaRendererProps {
  work: Work;
  className?: string;
}

function getVideoEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export function MediaRenderer({ work, className = '' }: MediaRendererProps): JSX.Element | null {
  switch (work.media_type) {
    case 'video': {
      if (!work.media_url) return null;
      const embedUrl = getVideoEmbedUrl(work.media_url);
      if (embedUrl) {
        return (
          <div className={`w-full aspect-video rounded-lg overflow-hidden ${className}`}>
            <iframe
              src={embedUrl}
              title={work.title}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full"
            />
          </div>
        );
      }
      // Direct video file (e.g. uploaded to Supabase Storage)
      const isVideoFile =
        /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i.test(work.media_url) ||
        work.media_url.includes('/storage/v1/object/');
      if (isVideoFile) {
        return (
          <div className={`w-full aspect-video rounded-lg overflow-hidden bg-black ${className}`}>
            <video
              src={work.media_url}
              controls
              playsInline
              poster={work.cover_url || undefined}
              className="w-full h-full object-contain"
            />
          </div>
        );
      }
      // Fallback to cover image
      if (work.cover_url) {
        return (
          <img
            src={work.cover_url}
            alt={work.title}
            className={`w-full h-full object-cover rounded-lg ${className}`}
          />
        );
      }
      return null;
    }

    case 'audio': {
      if (!work.media_url) return null;
      const isSoundCloud = work.media_url.includes('soundcloud.com');

      if (isSoundCloud) {
        return (
          <div
            className={`w-full rounded-lg overflow-hidden bg-cover bg-center ${className}`}
            style={work.cover_url ? { backgroundImage: `url(${work.cover_url})` } : {}}
          >
            <div className="w-full h-full backdrop-blur-sm bg-black/50 flex items-center justify-center">
              <a
                href={work.media_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
              >
                Listen on SoundCloud
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        );
      }

      return (
        <div
          className={`w-full rounded-lg overflow-hidden bg-cover bg-center ${className}`}
          style={work.cover_url ? { backgroundImage: `url(${work.cover_url})` } : {}}
        >
          <div className="w-full backdrop-blur-sm bg-black/50 p-4">
            <audio
              src={work.media_url}
              controls
              className="w-full"
            />
          </div>
        </div>
      );
    }

    case 'image': {
      const imageUrl = work.media_url || work.cover_url;
      if (!imageUrl) return null;
      return (
        <img
          src={imageUrl}
          alt={work.title}
          className={`w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${className}`}
        />
      );
    }

    case 'gallery': {
      if (!work.cover_url) return null;
      return (
        <img
          src={work.cover_url}
          alt={work.title}
          className={`w-full h-full object-cover rounded-lg ${className}`}
        />
      );
    }

    case 'embed': {
      if (!work.media_url) return null;

      if (work.media_url.includes('itch.io')) {
        return (
          <div className={`w-full aspect-video rounded-lg overflow-hidden ${className}`}>
            <iframe
              src={work.media_url}
              title={work.title}
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        );
      }

      if (work.media_url.includes('github.com')) {
        return (
          <a
            href={work.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors ${className}`}
          >
            <Github size={20} />
            View on GitHub
          </a>
        );
      }

      return (
        <a
          href={work.media_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors ${className}`}
        >
          <ExternalLink size={20} />
          View Project
        </a>
      );
    }

    default:
      return null;
  }
}
