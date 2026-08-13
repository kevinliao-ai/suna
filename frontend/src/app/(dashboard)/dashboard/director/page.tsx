import { DirectorPlanner } from '@/components/anime-director/director-planner';
import { getAnimeShotRecipe } from '@/lib/anime-shot-recipes';
import { getDirectorWorkflowCase } from '@/lib/director-workflow-cases';

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
  searchParams: Promise<{ recipe?: string; case?: string }>;
}) {
  const { recipe: recipeSlug, case: caseSlug } = await searchParams;
  const recipe = recipeSlug ? getAnimeShotRecipe(recipeSlug) : undefined;
  const workflowCase = caseSlug ? getDirectorWorkflowCase(caseSlug) : undefined;
  return <DirectorPlanner initialRecipe={recipe} initialCase={workflowCase} />;
}
