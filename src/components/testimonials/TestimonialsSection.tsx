import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, BadgeCheck, Building2, ChevronLeft, ChevronRight, Upload, Shield, Users } from 'lucide-react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
      breakpoints: {
        '(min-width: 640px)': { slidesToScroll: 1 },
        '(min-width: 1024px)': { slidesToScroll: 1 }
      }
    },
    [
      Autoplay({ 
        delay: 5000, 
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: false
      })
    ]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Intersection Observer for fade-in animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="mb-8 sm:mb-12 relative">
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
      <div className="relative">
        {/* Navigation Buttons - Hidden on mobile */}
        <Button
          variant="outline"
          size="icon"
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-2 hover:bg-background hover:scale-110 transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100 shadow-lg"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-2 hover:bg-background hover:scale-110 transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100 shadow-lg"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next testimonials"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-8px)] lg:flex-[0_0_calc(33.333%-16px)] transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-xl h-full">
                  <div className="relative p-5 sm:p-6 md:p-7 space-y-4 sm:space-y-5 flex flex-col h-full">
                    {/* Header with rating and company logo */}
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      {/* Rating with background */}
                      <div className="flex items-center gap-1 bg-muted/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-warning text-warning"
                          />
                        ))}
                      </div>
                      
                      {/* Company Logo */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-muted/60 to-muted/40 flex items-center justify-center text-lg sm:text-xl border border-border/40 flex-shrink-0">
                        {testimonial.companyLogo}
                      </div>
                    </div>

                    {/* Quote decoration */}
                    <div className="relative flex-1">
                      <svg 
                        className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-6 h-6 sm:w-8 sm:h-8 text-primary/20" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                      </svg>
                      
                      {/* Content */}
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base pt-5 sm:pt-6 relative z-10">
                        {testimonial.content}
                      </p>
                    </div>

                    {/* Author section */}
                    <div className="flex items-center gap-3 pt-4 sm:pt-5 border-t border-border/40">
                      <Avatar className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 ring-2 ring-primary/20 flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-primary via-primary-glow to-primary flex items-center justify-center">
                          <AvatarFallback className="bg-transparent text-primary-foreground font-bold text-sm sm:text-base">
                            {testimonial.initials}
                          </AvatarFallback>
                        </div>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-foreground text-sm sm:text-base truncate">
                            {testimonial.name}
                          </p>
                          {testimonial.verified && (
                            <BadgeCheck className="h-4 w-4 text-primary fill-primary/20 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground font-medium">
                          <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          <span className="truncate">{testimonial.role} • {testimonial.company}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel Navigation Dots */}
      <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? 'w-8 h-2 bg-primary'
                : 'w-2 h-2 bg-muted hover:bg-primary/50'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
            aria-current={index === selectedIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Mobile Navigation Buttons */}
      <div className="flex lg:hidden justify-center gap-3 mt-6">
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-2 hover:bg-background hover:scale-110 transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous testimonials"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-2 hover:bg-background hover:scale-110 transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next testimonials"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Call to Action Section */}
      <div className="mt-12 sm:mt-16 relative animate-fade-in">
        {/* Background glow effects */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        </div>

        <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl shadow-2xl group hover:border-primary/40 transition-all duration-500">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50"></div>
          
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 md:px-16 md:py-16 text-center space-y-6">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/90 shadow-2xl shadow-primary/40 mb-2 group-hover:scale-110 transition-transform duration-500">
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            {/* Heading */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                Ready to Get Started?
              </span>
            </h3>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
              Join thousands of satisfied users and experience secure, lightning-fast file sharing today. No credit card required.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => {
                  const uploadSection = document.getElementById('upload-section');
                  if (uploadSection) {
                    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="group/btn relative h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/95 text-white shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 active:scale-95 rounded-xl overflow-hidden"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
                
                <span className="relative flex items-center gap-3">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 group-hover/btn:rotate-12 transition-transform duration-300" />
                  Start Uploading Free
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-medium">5-Star Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">10,000+ Happy Users</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default TestimonialsSection;
