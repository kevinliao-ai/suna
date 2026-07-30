import { siteConfig } from '@/lib/home';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function FooterSection() {
  return (
    <footer id="footer" className="w-full">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-xl bg-foreground text-background">
              <Sparkles className="size-4" />
            </span>
            AniSora Studio
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>
          <p className="mt-5 text-xs text-muted-foreground">
            Independent product. Embedded services remain subject to their
            operators&apos; availability and terms.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {siteConfig.footerLinks.map((column) => (
            <div key={column.title}>
              <p className="mb-3 text-sm font-semibold">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={
                        link.url.startsWith('#') ? `/${link.url}` : link.url
                      }
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AniSora Studio
      </div>
    </footer>
  );
}
