import { BrandModelPage, brandPageMetadata } from '@/components/brand/brand-model-page';
import { getBrandPage } from '@/lib/anisora-brand-pages';

const page = getBrandPage('index-anisora');

export const metadata = brandPageMetadata(page);

export default function IndexAniSoraPage() {
  return <BrandModelPage page={page} />;
}
