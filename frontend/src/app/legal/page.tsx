import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Tab = 'terms' | 'privacy';

const sections: Record<Tab, { title: string; content: React.ReactNode }> = {
  terms: {
    title: 'Terms of Service',
    content: (
      <>
        <h2>1. About the service</h2>
        <p>
          AniSora Studio is an independent interface for organizing creative
          projects and accessing selected AI media tools. It is not the official
          service of Bilibili, IndexTTS, OpenAI, or the operators of embedded
          applications.
        </p>
        <h2>2. External providers</h2>
        <p>
          Some generation features are delivered in embedded third-party
          applications. Their availability, processing, output rights, data
          handling, and usage limits are governed by their own terms. AniSora
          cannot guarantee that an external tool will remain available or
          unchanged.
        </p>
        <h2>3. Your responsibilities</h2>
        <p>
          You must have the rights required for media you upload and must not
          use the service for unlawful, deceptive, abusive, or rights-infringing
          activity. You are responsible for reviewing model and provider
          licenses before publishing or commercializing an output.
        </p>
        <h2>4. Accounts and project data</h2>
        <p>
          Account authentication is provided through Supabase. AniSora keeps a
          browser copy of your Studio projects, tasks, selected tools, and saved
          asset links. When cloud synchronization is enabled for your
          deployment and account, that project metadata is also stored in
          Supabase so it can be restored after a refresh or on another browser.
          Prompts, uploads, and generated media entered inside an embedded tool
          are not part of this Studio metadata.
        </p>
        <h2>5. Availability and warranties</h2>
        <p>
          The service is provided on an “as available” basis. Features may be
          modified or removed as the product and its providers evolve. To the
          extent allowed by law, no warranty is made about uninterrupted
          operation, generated content, or fitness for a particular purpose.
        </p>
      </>
    ),
  },
  privacy: {
    title: 'Privacy Policy',
    content: (
      <>
        <h2>1. Data AniSora processes</h2>
        <p>
          Supabase processes account identifiers, email address, and session
          information for authentication. AniSora may receive basic performance
          and usage events through Vercel Analytics, Vercel Speed Insights, and
          PostHog when those services are enabled in the deployment.
        </p>
        <h2>2. Studio project metadata</h2>
        <p>
          AniSora stores a browser copy of Studio project names, tasks, selected
          tools, and saved asset links. Anyone with access to the same browser
          profile may be able to access that copy. When cloud synchronization
          is enabled, the same metadata is stored in Supabase under your account
          and protected by per-user access policies. AniSora does not include
          prompts, uploads, or generated media entered inside an embedded tool
          in this metadata sync.
        </p>
        <h2>3. Embedded tools</h2>
        <p>
          Prompts, uploads, and other information entered inside an embedded
          application are sent directly to that external operator. Review the
          relevant provider&apos;s privacy notice before submitting sensitive or
          confidential content.
        </p>
        <h2>4. Cookies and retention</h2>
        <p>
          Authentication cookies maintain your session. Analytics providers may
          use cookies or similar identifiers according to their configuration.
          The browser copy remains until you remove it or clear browser
          storage. Cloud-synchronized metadata remains until you delete it,
          delete your account, or request deletion, subject to operational
          backup retention.
        </p>
        <h2>5. Contact and requests</h2>
        <p>
          For privacy questions or account deletion requests, email{' '}
          <a href="mailto:liaokuanya0907@gmail.com">
            liaokuanya0907@gmail.com
          </a>
          . Requests are handled subject to identity verification and applicable
          law.
        </p>
      </>
    ),
  },
};

export default async function LegalPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab: Tab = params.tab === 'privacy' ? 'privacy' : 'terms';
  const section = sections[tab];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to AniSora
        </Link>

        <p className="mt-14 text-sm font-medium text-muted-foreground">
          Last updated: July 30, 2026
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {section.title}
        </h1>

        <nav className="mt-8 flex gap-2 border-b border-border pb-4">
          {(['terms', 'privacy'] as const).map((item) => (
            <Link
              key={item}
              href={`/legal?tab=${item}`}
              className={`rounded-full px-4 py-2 text-sm ${
                tab === item
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {item === 'terms' ? 'Terms' : 'Privacy'}
            </Link>
          ))}
        </nav>

        <article className="mt-10 max-w-none [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-3 [&_p]:leading-7 [&_p]:text-muted-foreground">
          {section.content}
        </article>
      </div>
    </main>
  );
}
