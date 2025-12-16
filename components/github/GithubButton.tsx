'use client';

import { useEffect, useState } from 'react';
import { Github, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface GithubButtonProps {
  repositoryUrl?: string;
  className?: string;
  showStars?: boolean;
  size?: 'sm' | 'md';
}

export function GithubButton({
  repositoryUrl = 'https://github.com/yunweneric/ccmc_notes',
  className,
  showStars = true,
  size = 'sm',
}: GithubButtonProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!showStars) {
      setIsLoading(false);
      return;
    }

    const fetchStars = async () => {
      try {
        const response = await fetch('/api/github/stars');
        if (response.ok) {
          const data = await response.json();
          setStars(data.stars);
        }
      } catch (error) {
        console.error('Failed to fetch GitHub stars:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStars();
  }, [showStars]);

  const sizeClasses = size === 'sm' ? 'h-9 w-9 p-0' : 'h-10 w-10 p-0';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  const buttonBaseClasses =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-zinc-300 dark:border-zinc-700 bg-background text-foreground hover:bg-accent hover:text-accent-foreground';

  return (
    <div className="relative inline-flex items-center">
      <a
        href={repositoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
        className={cn(
          buttonBaseClasses,
          sizeClasses,
          className
        )}
      >
        <Github className={cn(iconSize, 'text-zinc-700 dark:text-zinc-300')} />
      </a>
      {showStars && stars !== null && (
        <Badge
          variant="secondary"
          className="absolute -top-2 -right-2 flex items-center gap-1 h-5 px-1.5 text-[10px] font-medium shadow-sm"
        >
          <Star className="h-2.5 w-2.5 fill-current" />
          <span>{stars > 999 ? `${(stars / 1000).toFixed(1)}k` : stars}</span>
        </Badge>
      )}
      {showStars && isLoading && (
        <Badge
          variant="secondary"
          className="absolute -top-2 -right-2 h-5 w-8 animate-pulse"
        />
      )}
    </div>
  );
}

