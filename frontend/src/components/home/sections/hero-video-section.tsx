import { HeroVideoDialog } from '@/components/home/ui/hero-video-dialog';
const AniSoraHeroVideo = `/AniSoraHeroVideo.mp4`;

export function HeroVideoSection() {
  return (
    <div className="relative px-6 mt-10">
      <div className="relative w-full max-w-3xl mx-auto shadow-xl rounded-2xl overflow-hidden">
        <HeroVideoDialog
          className="block dark:hidden"
          animationStyle="from-center"
          videoSrc={AniSoraHeroVideo}
          // thumbnailSrc="/thumbnail-light.png"
          thumbnailAlt="Video Demos"
        />
        <HeroVideoDialog
          className="hidden dark:block"
          animationStyle="from-center"
          videoSrc={AniSoraHeroVideo}
          // thumbnailSrc="/thumbnail-dark.png"
          thumbnailAlt="Video Demos"
        />
      </div>
    </div>
  );
}
