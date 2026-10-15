import { BrandModelPage, brandPageMetadata } from '@/components/brand/brand-model-page';
import { getBrandPage } from '@/lib/anisora-brand-pages';

const page = getBrandPage('anisora-v3-2');

export const metadata = brandPageMetadata(page);

export default function AniSoraV32Page() {
  return <BrandModelPage page={page} />;
}
