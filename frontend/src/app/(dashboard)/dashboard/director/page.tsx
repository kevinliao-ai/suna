import { DirectorPlanner } from '@/components/anime-director/director-planner';
import { getAnimeShotRecipe } from '@/lib/anime-shot-recipes';

export const metadata = {
  title: 'Anime Director Planner',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DirectorPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ recipe?: string }>;
}) {
  const { recipe: recipeSlug } = await searchParams;
  const recipe = recipeSlug ? getAnimeShotRecipe(recipeSlug) : undefined;
  return <DirectorPlanner initialRecipe={recipe} />;
}
