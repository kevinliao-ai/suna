import { DirectorPlanner } from '@/components/anime-director/director-planner';

export const metadata = {
  title: 'Anime Director Planner',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DirectorPlannerPage() {
  return <DirectorPlanner />;
}
