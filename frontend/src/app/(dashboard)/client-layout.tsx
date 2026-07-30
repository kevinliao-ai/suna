'use client';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
