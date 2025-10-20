"use client";

import { useState } from 'react';
import { FlickeringGrid } from '@/components/home/ui/flickering-grid';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Loader2, Link as LinkIcon, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParseResult {
  success: boolean;
  data?: {
    links: {
      mp4: string;
      thumbnail: string;
      post_id: string;
    };
  };
  error?: string;
  message?: string;
}

export function SoraWatermarkHero() {
  const tablet = useMediaQuery('(max-width: 1024px)');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useState(() => setMounted(true));

  const handleParse = async () => {
    if (!videoUrl.trim()) {
      setResult({
        success: false,
        message: 'Please enter a Sora video link'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/watermark/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: videoUrl.trim() }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error, please check your connection and try again'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result?.success && result.data?.links.mp4) {
      window.open(result.data.links.mp4, '_blank');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleParse();
    }
  };

  return (
    <section id="hero" className="w-full relative overflow-hidden">
      <div className="relative flex flex-col items-center w-full px-4 sm:px-6">
        {/* 左侧背景网格 */}
        <div className="absolute left-0 top-0 h-[500px] sm:h-[600px] md:h-[800px] w-1/3 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background z-10" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
          <FlickeringGrid
            className="h-full w-full"
            squareSize={mounted && tablet ? 2 : 2.5}
            gridGap={mounted && tablet ? 2 : 2.5}
            color="var(--secondary)"
            maxOpacity={0.4}
            flickerChance={0.03}
          />
        </div>

        {/* 右侧背景网格 */}
        <div className="absolute right-0 top-0 h-[500px] sm:h-[600px] md:h-[800px] w-1/3 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-background z-10" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/90 to-transparent z-10" />
          <FlickeringGrid
            className="h-full w-full"
            squareSize={mounted && tablet ? 2 : 2.5}
            gridGap={mounted && tablet ? 2 : 2.5}
            color="var(--secondary)"
            maxOpacity={0.4}
            flickerChance={0.03}
          />
        </div>

        {/* 中间背景 */}
        <div className="absolute inset-x-1/4 top-0 h-[500px] sm:h-[600px] md:h-[800px] -z-20 bg-background rounded-b-xl"></div>

        {/* 主要内容 */}
        <div className="relative z-10 pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 max-w-4xl mx-auto h-full w-full flex flex-col gap-6 sm:gap-8 items-center justify-center">
          {/* 标题 */}
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-balance text-center px-4">
              Sora Video <span className="text-secondary">Watermark Remover</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-center text-muted-foreground font-medium text-balance leading-relaxed tracking-tight max-w-2xl px-4">
              Free, fast and safe! Easily save Sora AI-generated high-quality videos without watermarks for viewing and sharing
            </p>
          </div>

          {/* 输入框和按钮 */}
          <div className="w-full max-w-2xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Paste Sora video share link..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <Button
                onClick={handleParse}
                disabled={loading || !videoUrl.trim()}
                size="lg"
                className="h-11 sm:h-12 px-6 sm:px-8 whitespace-nowrap text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Parse Video
                  </>
                )}
              </Button>
            </div>

            {/* 结果展示 */}
            {result && (
              <div className={cn(
                "mt-4 p-3 sm:p-4 rounded-lg border",
                result.success 
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" 
                  : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
              )}>
                <div className="flex items-start gap-2 sm:gap-3">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium mb-1 text-sm sm:text-base",
                      result.success 
                        ? "text-green-900 dark:text-green-100" 
                        : "text-red-900 dark:text-red-100"
                    )}>
                      {result.success ? '✨ Success!' : '❌ Failed'}
                    </p>
                    <p className={cn(
                      "text-xs sm:text-sm break-words",
                      result.success 
                        ? "text-green-700 dark:text-green-300" 
                        : "text-red-700 dark:text-red-300"
                    )}>
                      {result.message || (result.success ? 'Watermark-free video is ready. Click the download button to save it locally' : 'Please check the link and try again')}
                    </p>
                    {result.success && result.data?.links.mp4 && (
                      <Button
                        onClick={handleDownload}
                        className="mt-3 w-full sm:w-auto"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download HD Video
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 提示文字 */}
          <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xl px-4">
            Supports all Sora platform shared video links • Completely free • No registration required • Privacy protected
          </p>
        </div>
      </div>
    </section>
  );
}
