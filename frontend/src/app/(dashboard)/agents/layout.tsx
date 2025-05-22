import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Conversation | Kortix AniSora',
  description: 'Interactive agent conversation powered by Kortix AniSora',
  openGraph: {
    title: 'Agent Conversation | Kortix AniSora',
    description: 'Interactive agent conversation powered by Kortix AniSora',
    type: 'website',
  },
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
