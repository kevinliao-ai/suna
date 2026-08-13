import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const files = {
  directory: new URL(
    '../src/components/recipes/recipe-directory.tsx',
    import.meta.url,
  ),
  tracker: new URL(
    '../src/components/recipes/recipe-funnel-tracker.tsx',
    import.meta.url,
  ),
  planner: new URL(
    '../src/components/recipes/recipe-planner-link.tsx',
    import.meta.url,
  ),
  director: new URL(
    '../src/components/anime-director/director-planner.tsx',
    import.meta.url,
  ),
  billing: new URL(
    '../src/components/billing-action-button.tsx',
    import.meta.url,
  ),
  dashboard: new URL(
    '../src/app/(dashboard)/dashboard/page.tsx',
    import.meta.url,
  ),
};

test('the search-to-paid funnel has explicit privacy-safe milestones', async () => {
  const source = (
    await Promise.all(
      Object.values(files).map((file) => readFile(file, 'utf8')),
    )
  ).join('\n');

  for (const event of [
    'recipe_directory_viewed',
    'recipe_collection_viewed',
    'recipe_filter_used',
    'recipe_viewed',
    'recipe_start_clicked',
    'director_recipe_loaded',
    'director_project_created',
    'director_post_save_upgrade_clicked',
    'billing_checkout_started',
    'billing_checkout_returned_success',
  ]) {
    assert.match(source, new RegExp(event));
  }

  assert.doesNotMatch(source, /posthog\.capture\([^)]*(email|prompt|script)/s);
});
