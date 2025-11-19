import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, BadgeCheck, Building2 } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  initials: string;
  verified: boolean;
  companyLogo: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CTO",
    company: "TechStart Inc",
    content: "FileShare Pro has transformed how our team collaborates. The security features and speed are unmatched. We've saved hours every week!",
    rating: 5,
    initials: "SJ",
    verified: true,
    companyLogo: "🚀"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Product Manager",
    company: "Innovation Labs",
    content: "The PIN protection and auto-expiration features give us peace of mind when sharing sensitive documents. Highly recommended!",
    rating: 5,
    initials: "MC",
    verified: true,
    companyLogo: "💡"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Freelance Designer",
    company: "Creative Studio",
    content: "As a freelancer, I need to share large design files daily. This platform makes it incredibly easy and fast. The UI is beautiful too!",
    rating: 5,
    initials: "ER",
    verified: true,
    companyLogo: "🎨"
  },
  {
    id: 4,
    name: "David Kim",
    role: "IT Director",
    company: "Global Corp",
    content: "We tested multiple file sharing solutions. FileShare Pro's encryption and compliance features won us over. Perfect for enterprise use.",
    rating: 5,
    initials: "DK",
    verified: true,
    companyLogo: "🌐"
  },
  {
    id: 5,
    name: "Jessica Martinez",
    role: "Marketing Lead",
    company: "Brand Agency",
    content: "The nearby share feature is a game-changer for our team meetings. Instant file transfers without email hassle!",
    rating: 5,
    initials: "JM",
    verified: true,
    companyLogo: "📱"
  },
  {
    id: 6,
    name: "Alex Thompson",
    role: "Developer",
    company: "Code Factory",
    content: "Clean interface, fast uploads, and great API. Everything a developer could want in a file sharing platform.",
    rating: 5,
    initials: "AT",
    verified: true,
    companyLogo: "💻"
  }
];

const TestimonialsSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
    },
    [
      Autoplay({ 
        delay: 4000, 
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: false
      })
    ]
  );

  return (
    <section className="mb-16 sm:mb-24 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="text-center mb-12 sm:mb-16 space-y-4 animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4">
          <Star className="h-4 w-4 text-primary fill-primary" />
          <span className="text-sm font-semibold text-primary">Trusted by thousands</span>
        </div>
        
        {/* Main heading */}
        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            Loved by Thousands
          </span>
        </h3>
        
        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
          See what our users are saying about their experience
        </p>
      </div>

      {/* Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-21.33px)]"
            >
              <Card
                className="group relative overflow-hidden hover:shadow-hover transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 border-border/40 bg-card/80 backdrop-blur-xl h-full"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="relative p-6 sm:p-8 space-y-5 flex flex-col h-full">
                  {/* Header with rating and company logo */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Rating with background */}
                    <div className="flex items-center gap-1 bg-muted/40 px-3 py-2 rounded-lg">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-warning text-warning transition-transform duration-300 group-hover:scale-110"
                          style={{ transitionDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>
                    
                    {/* Company Logo */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 flex items-center justify-center text-xl border border-border/40 group-hover:scale-110 transition-transform duration-300">
                      {testimonial.companyLogo}
                    </div>
                  </div>

                  {/* Quote decoration */}
                  <div className="relative flex-1">
                    <svg 
                      className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                    </svg>
                    
                    {/* Content */}
                    <p className="text-muted-foreground leading-relaxed text-base pt-6 relative z-10 group-hover:text-foreground transition-colors duration-300">
                      {testimonial.content}
                    </p>
                  </div>

                  {/* Author section */}
                  <div className="flex items-center gap-4 pt-5 border-t border-border/40">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                      <div className="w-full h-full bg-gradient-to-br from-primary via-primary-glow to-primary flex items-center justify-center">
                        <AvatarFallback className="bg-transparent text-primary-foreground font-bold text-base">
                          {testimonial.initials}
                        </AvatarFallback>
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-foreground text-base group-hover:text-primary transition-colors duration-300 truncate">
                          {testimonial.name}
                        </p>
                        {testimonial.verified && (
                          <BadgeCheck className="h-4 w-4 text-primary fill-primary/20 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{testimonial.role} • {testimonial.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/20 transition-all duration-500 pointer-events-none"></div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
          <button
            key={i}
            className="w-2 h-2 rounded-full bg-muted hover:bg-primary/50 transition-all duration-300"
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
