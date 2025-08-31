import { SectionHeader } from '@/components/home/section-header';
import { SocialProofTestimonials } from '@/components/home/testimonial-scroll';
import { siteConfig } from '@/lib/home';

export function TestimonialSection() {
  const { testimonials } = siteConfig;

  return (
    <section
      id="testimonials"
      className="flex flex-col items-center justify-center w-full"
    >
      <div className="w-full px-6">
        <SectionHeader>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance">
            Revolutionizing Animation with AI
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            Experience the next generation of animation generation with precise
            temporal and spatial control for stunning visual storytelling
          </p>
        </SectionHeader>
        <SocialProofTestimonials testimonials={testimonials} />
      </div>
    </section>
  );
}
