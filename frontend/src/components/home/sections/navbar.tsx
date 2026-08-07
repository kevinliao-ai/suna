'use client';

import { useAuth } from '@/components/AuthProvider';
import { ThemeToggle } from '@/components/home/theme-toggle';
import { siteConfig } from '@/lib/home';
import { Menu, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hrefFor = (href: string) =>
    href.startsWith('#') && pathname !== '/' ? `/${href}` : href;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-xl bg-foreground text-background">
            <Sparkles className="size-4" />
          </span>
          AniSora Studio
        </Link>

        <nav className="mx-auto hidden items-center gap-6 md:flex">
          {siteConfig.nav.links.map((item) => (
            <Link
              key={item.id}
              href={hrefFor(item.href)}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            href="/pricing"
            className="rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-500"
          >
            Upgrade
          </Link>
          <Link
            href={user ? '/dashboard' : '/auth?returnUrl=/dashboard'}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-80"
          >
            {user ? 'Open Studio' : 'Sign in'}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="ml-auto grid size-9 place-items-center rounded-lg hover:bg-accent md:hidden"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1">
            {siteConfig.nav.links.map((item) => (
              <Link
                key={item.id}
                href={hrefFor(item.href)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
              <ThemeToggle />
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-violet-600 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Upgrade
              </Link>
              <Link
                href={user ? '/dashboard' : '/auth?returnUrl=/dashboard'}
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg bg-foreground px-4 py-2 text-center text-sm font-medium text-background"
              >
                {user ? 'Open Studio' : 'Sign in'}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

