import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-foreground text-background">
          <Sparkles className="size-5" />
        </span>
        <p className="mt-8 text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          This page has moved
        </h1>
        <p className="mt-4 text-muted-foreground">
          The old Suna route is no longer part of AniSora Studio.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background"
        >
          <ArrowLeft className="size-4" />
          Return home
        </Link>
      </div>
    </main>
  );
}
