'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { Portal } from '@/components/ui/portal';
import { Menu, X, Github } from 'lucide-react';
import { useGitHubStars } from '@/hooks/use-github-stars';
import { useRouter } from 'next/navigation';
// Dynamically import the BilibiliEmbed component with no SSR
const BilibiliEmbed = dynamic(
  () => import('@/components/bilibili-embed').then((mod) => mod.BilibiliEmbed),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          Loading Bilibili content...
        </div>
      </div>
    ),
  },
);

export default function DashboardPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTool, setActiveTool] = useState<'anisora' | 'index-tts'>('anisora');
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const router = useRouter();
  // determine GitHub repo based on active tool
  const ghOwner = activeTool === 'anisora' ? 'bilibili' : 'index-tts';
  const ghRepo = activeTool === 'anisora' ? 'Index-anisora' : 'index-tts';
  const ghHref = activeTool === 'anisora' ? 'https://github.com/bilibili/Index-anisora' : 'https://github.com/index-tts/index-tts';
  const { formattedStars, loading: starsLoading } = useGitHubStars(ghOwner, ghRepo);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const drawerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 15, stiffness: 200 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.12 } },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // read query param after mount to avoid hydration mismatch
  useEffect(() => {
    if (!mounted) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tool');
      if (t === 'index-tts') setActiveTool('index-tts');
    } catch (e) {
      // ignore
    }
  }, [mounted]);

  const logoSrc = !mounted
    ? 'https://cdn.anisora.ai/anisora-logo.png'
    : resolvedTheme === 'dark'
      ? 'https://cdn.anisora.ai/anisora-logo.png'
      : 'https://cdn.anisora.ai/anisora-logo.png';

  return (
    <div className="flex flex-col h-full w-full">
      {/* Simple Header with Logo */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Link href="/" className="flex items-center -ml-1.5">
            <Image
              src={logoSrc}
              alt="AniSora Logo"
              width={120}
              height={24}
              className="h-6 w-auto"
              priority
            />
          </Link>
          {/* Tool switcher on the right */}
          <div className="ml-auto flex items-center gap-2">
            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                aria-pressed={activeTool === 'anisora'}
                aria-label="Switch to AniSora tool"
                title="Switch to AniSora"
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-150 ${activeTool === 'anisora' ? 'bg-accent text-accent-foreground shadow-md ring-2 ring-accent/30' : 'bg-transparent border border-accent/20 text-accent-foreground/80 hover:bg-accent/10 hover:text-accent-foreground'}`}
                onClick={() => {
                  setActiveTool('anisora');
                  try { const url = new URL(window.location.href); url.searchParams.set('tool','anisora'); window.history.replaceState({},'',url.toString()); } catch(e){ }
                }}
              >
                AniSora
              </button>

              <button
                type="button"
                aria-pressed={activeTool === 'index-tts'}
                aria-label="Switch to Index‑TTS demo"
                title="Switch to Index‑TTS"
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-150 ${activeTool === 'index-tts' ? 'bg-accent text-accent-foreground shadow-md ring-2 ring-accent/30' : 'bg-transparent border border-accent/20 text-accent-foreground/80 hover:bg-accent/10 hover:text-accent-foreground'}`}
                onClick={() => {
                  setActiveTool('index-tts');
                  try { const url = new URL(window.location.href); url.searchParams.set('tool','index-tts'); window.history.replaceState({},'',url.toString()); } catch(e){ }
                }}
              >
                Index‑TTS
              </button>
            </div>
            {/* Mobile: small menu button (styled like navbar) */}
            <div className="flex sm:hidden items-center relative">
              <button
                className="md:hidden border border-border size-8 rounded-md cursor-pointer flex items-center justify-center"
                onClick={() => setMobileToolsOpen((s) => !s)}
                aria-label="Tools menu"
                title="Tools"
              >
                {mobileToolsOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>

              <Portal>
                <AnimatePresence>
                  {mobileToolsOpen && (
                    <>
                      <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={overlayVariants}
                        transition={{ duration: 0.2 }}
                        onClick={() => setMobileToolsOpen(false)}
                      />

                      <motion.div
                        className="fixed inset-x-0 w-[95%] mx-auto bottom-3 bg-background border border-border p-4 rounded-xl shadow-lg z-50"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={drawerVariants}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-3">
                              <Image src={logoSrc} alt="AniSora Logo" width={120} height={22} priority />
                            </Link>
                            <button onClick={() => setMobileToolsOpen(false)} className="border border-border rounded-md p-1 cursor-pointer">
                              <X className="size-5" />
                            </button>
                          </div>

                          <motion.ul className="flex flex-col text-sm mb-4 border border-border rounded-md" variants={drawerVariants}>
                            <li className="p-2.5 border-b border-border last:border-b-0">
                              <button className={`w-full text-left px-3 py-2 ${activeTool === 'anisora' ? 'text-primary font-medium' : 'text-primary/60'}`} onClick={() => { setActiveTool('anisora'); try { const url = new URL(window.location.href); url.searchParams.set('tool','anisora'); window.history.replaceState({},'',url.toString()); } catch(e){ } setMobileToolsOpen(false); }}>AniSora</button>
                            </li>
                            <li className="p-2.5 border-b border-border last:border-b-0">
                              <button className={`w-full text-left px-3 py-2 ${activeTool === 'index-tts' ? 'text-primary font-medium' : 'text-primary/60'}`} onClick={() => { setActiveTool('index-tts'); try { const url = new URL(window.location.href); url.searchParams.set('tool','index-tts'); window.history.replaceState({},'',url.toString()); } catch(e){ } setMobileToolsOpen(false); }}>Index‑TTS</button>
                            </li>
                          </motion.ul>

                          <Link
                            href={ghHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 h-7 px-2.5 text-xs font-medium rounded-full bg-transparent text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/30 transition-all duration-200"
                            aria-label="GitHub Repository"
                          >
                            <Github className="size-3.5" />
                            <span className={`text-xs font-medium transition-opacity duration-200 ${starsLoading ? 'opacity-50' : 'opacity-100'}`}>
                              ⭐ {formattedStars}
                            </span>
                          </Link>

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between">
                              <button
                                onClick={() => {
                                  // navigate to home or index-tts marketing page depending on activeTool
                                  setMobileToolsOpen(false);
                                  try {
                                    if (activeTool === 'index-tts') {
                                      router.push('/index-tts');
                                    } else {
                                      router.push('/');
                                    }
                                  } catch (e) {
                                    // fallback to full navigation
                                    try {
                                      if (activeTool === 'index-tts') {
                                        window.location.href = '/index-tts';
                                      } else {
                                        window.location.href = '/';
                                      }
                                    } catch (err) {
                                      /* ignore */
                                    }
                                  }
                                }}
                                className="bg-secondary h-8 flex items-center justify-center text-sm font-normal tracking-wide rounded-full text-primary-foreground dark:text-secondary-foreground w-full px-4 border border-white/[0.12] hover:bg-secondary/80 transition-all ease-out active:scale-95"
                              >
                                Home
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </Portal>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 w-full overflow-hidden">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="animate-pulse">Loading Bilibili content...</div>
            </div>
          }
        >
          <div className="h-[calc(100vh-58px)] w-full">
            {activeTool === 'anisora' ? (
              <BilibiliEmbed url="https://bilibili-index-anisora.ms.show/" />
            ) : (
              <>
                <div className="h-full w-full flex items-center justify-center bg-muted/5">
                  {iframeLoading && (
                    <div className="animate-pulse">Loading Index‑TTS demo…</div>
                  )}
                  {iframeError ? (
                    <div className="p-4 text-center">
                      <div className="mb-2">Unable to load demo (the remote site may block embedding).</div>
                      <div className="flex items-center justify-center gap-2">
                        <a
                          className="underline"
                          href="https://indexteam-indextts-2-demo.ms.show/?t=1769994646766&__theme=light&studio_token=32ee25c8-9b0c-4653-ad21-518a95bc5066&backend_url=/"
                          target="_blank"
                          rel="noreferrer"
                        >Open in new window</a>
                        <button
                          className="px-2 py-1 rounded bg-muted/50"
                          onClick={() => {
                            setIframeError(null);
                            setIframeLoading(true);
                            // retry by forcing reload
                            const el = document.getElementById('index-tts-iframe') as HTMLIFrameElement | null;
                            if (el) {
                              el.src = el.src;
                            }
                          }}
                        >Retry</button>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      id="index-tts-iframe"
                      title="Index-TTS Demo"
                      src="https://indexteam-indextts-2-demo.ms.show/?t=1769994646766&__theme=light&studio_token=32ee25c8-9b0c-4653-ad21-518a95bc5066&backend_url=/"
                      className="h-full w-full border-0"
                      sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
                      allow="microphone; autoplay"
                      onLoad={() => { setIframeLoading(false); setIframeError(null); }}
                      onError={() => { setIframeLoading(false); setIframeError('load-failed'); }}
                    />
                  )}
                  {/* show loader only when iframe not yet loaded */}
                  {!iframeLoading && !iframeError && (
                    // start loading when index-tts is selected
                    <script dangerouslySetInnerHTML={{ __html: '/* loader marker */' }} />
                  )}
                </div>

                {/* Desktop GitHub info (same style as mobile drawer) */}
                <div className="hidden sm:flex items-center gap-3 ml-2">
                  <Link
                    href={ghHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium rounded-full bg-transparent text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/30 transition-all duration-200"
                    aria-label="GitHub Repository"
                  >
                    <Github className="size-3.5" />
                    <span className={`text-xs font-medium transition-opacity duration-200 ${starsLoading ? 'opacity-50' : 'opacity-100'}`}>
                      ⭐ {formattedStars}
                    </span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Suspense>
      </div>
    </div>
  );
}
