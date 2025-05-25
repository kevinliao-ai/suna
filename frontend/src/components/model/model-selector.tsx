'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { videoApi } from "@/lib/api-video";
import { cn } from "@/lib/utils";

import type { VideoModel } from "@/lib/api-video";

// Extend VideoModel interface to include UI-specific properties
type UIVideoModel = VideoModel & {
  thumbnail?: string;
  tags?: string[];
  version?: string;
  resolution?: string;
  fps?: number;
  max_duration?: number;
};

// Custom Icons
type IconProps = React.ComponentProps<typeof Icons[keyof typeof Icons]>;

const CustomIcons = {
  ...Icons,
  alertCircle: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  alertTriangle: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  video: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  star: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  monitor: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  film: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  ),
  clock: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
} as const satisfies Record<keyof typeof Icons | 'alertCircle' | 'alertTriangle' | 'video' | 'star' | 'monitor' | 'film' | 'clock', React.FC<IconProps>>;

export function ModelSelector({ 
  selectedModel, 
  onModelChange 
}: { 
  selectedModel: string; 
  onModelChange: (modelId: string) => void 
}) {
    const defaultModels: UIVideoModel[] = [
    {
      id: 'animesora-v1',
      name: 'AnimeSora V1',
      description: 'Anime style video generation with smooth motion',
      is_recommended: true,
      thumbnail: '/models/anime-thumb.jpg',
      tags: ['Anime', 'Smooth', 'HD'],
      version: '1.0',
      resolution: '1280x720',
      fps: 24,
      max_duration: 10
    },
    {
      id: 'realsora-v1',
      name: 'RealSora V1',
      description: 'Photorealistic video generation',
      is_recommended: false,
      thumbnail: '/models/real-thumb.jpg',
      tags: ['Realistic', 'High Quality', '4K'],
      version: '1.2',
      resolution: '1920x1080',
      fps: 30,
      max_duration: 15
    },
    {
      id: 'pixsora-v1',
      name: 'PixSora V1',
      description: 'Pixar-style 3D animation generation',
      is_recommended: false,
      thumbnail: '/models/pixar-thumb.jpg',
      tags: ['3D', 'Animation', 'Pixar'],
      version: '0.9',
      resolution: '1280x720',
      fps: 24,
      max_duration: 8
    }
  ];

  const [models, setModels] = useState<UIVideoModel[]>(defaultModels);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Icons for this component
  const IconsWithExtras = CustomIcons;

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        let data: VideoModel[];
        
        try {
          // 尝试从API获取模型
          data = await videoApi.listModels() as VideoModel[];
          // 确保至少有一个推荐模型
          if (!data.some(m => m.is_recommended) && data.length > 0) {
            data[0].is_recommended = true;
          }
        } catch (err) {
          console.warn('Using default models due to API error:', err);
          data = defaultModels;
        }
        
        setModels(data);
        
        // 自动选择推荐模型或第一个模型
        if (!selectedModel && data.length > 0) {
          const recommended = data.find(model => model.is_recommended) || data[0];
          onModelChange(recommended.id);
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
        setError('Using default models. Some features may be limited.');
        setModels(defaultModels);
        onModelChange(defaultModels[0].id);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [selectedModel, onModelChange]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Select Model</CardTitle>
            <IconsWithExtras.spinner className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="h-12 w-12 bg-muted rounded-md animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Model</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-start">
            <IconsWithExtras.alertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Unable to load models</p>
              <p className="mt-1">{error} Using default models instead.</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            <IconsWithExtras.refresh className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (models.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">No Models Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-2">
            <IconsWithExtras.alertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No models found.</p>
            <p className="text-sm text-muted-foreground">Please check back later or contact support.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              <IconsWithExtras.refresh className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Select Model</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled
            title="Coming soon"
          >
            <Icons.plus className="mr-2 h-4 w-4" />
            Add Custom Model
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm rounded-lg flex items-start">
            <IconsWithExtras.alertTriangle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="space-y-3">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isSelected={selectedModel === model.id}
              onSelect={() => onModelChange(model.id)}
            />
          ))}
        </div>
        <div className="pt-2 text-xs text-muted-foreground text-center">
          <p>
            Need a different model?{" "}
            <a href="#" className="text-primary hover:underline">
              Request access
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ModelCard Component
function ModelCard({
  model,
  isSelected,
  onSelect,
}: {
  model: UIVideoModel;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icons = CustomIcons; // Use the custom icons within this component
  return (
    <div
      className={cn(
        "group relative p-4 border rounded-xl cursor-pointer transition-all",
        isSelected
          ? "border-primary/50 ring-2 ring-primary/20 bg-primary/5"
          : "border-border hover:border-primary/30 hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden">
            {model.thumbnail ? (
              <img
                src={model.thumbnail}
                alt={model.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Icons.video className="h-6 w-6 text-primary/50" />
              </div>
            )}
          </div>
          {model.is_recommended && (
            <div className="absolute -top-2 -right-2">
              <div className="bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center">
                <Icons.star className="h-2.5 w-2.5 mr-1 fill-current" />
                <span>Recommended</span>
              </div>
            </div>
          )}
        </div>
        {/* Model Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-sm flex items-center">
                {model.name}
                {model.version && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    v{model.version}
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {model.description}
              </p>
            </div>
            <div
              className={cn(
                "flex-shrink-0 ml-2 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-primary border-primary text-white"
                  : "border-muted-foreground/30 group-hover:border-primary/50"
              )}
            >
              {isSelected && (
                <Icons.check className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
          {/* Tags */}
          {model.tags && model.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {model.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {model.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                  +{model.tags.length - 3}
                </span>
              )}
            </div>
          )}
          {/* Model Specs */}
          <div className="mt-2 flex items-center text-xs text-muted-foreground space-x-3">
            {model.resolution && (
              <div className="flex items-center">
                <Icons.monitor className="h-3 w-3 mr-1" />
                <span>{model.resolution}</span>
              </div>
            )}
            {model.fps && (
              <div className="flex items-center">
                <Icons.refresh className="h-3.5 w-3.5 mr-1.5" />
                <span>{model.fps} FPS</span>
              </div>
            )}
            {model.max_duration && (
              <div className="flex items-center">
                <Icons.clock className="h-3 w-3 mr-1" />
                <span>Up to {model.max_duration}s</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
