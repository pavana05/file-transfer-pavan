import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "CTO",
    company: "TechStart Inc",
    content: "FileShare Pro has transformed how our team collaborates. The security features and speed are unmatched. We've saved hours every week!",
    rating: 5,
    initials: "SJ"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Product Manager",
    company: "Innovation Labs",
    content: "The PIN protection and auto-expiration features give us peace of mind when sharing sensitive documents. Highly recommended!",
    rating: 5,
    initials: "MC"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Freelance Designer",
    company: "Creative Studio",
    content: "As a freelancer, I need to share large design files daily. This platform makes it incredibly easy and fast. The UI is beautiful too!",
    rating: 5,
    initials: "ER"
  },
  {
    id: 4,
    name: "David Kim",
    role: "IT Director",
    company: "Global Corp",
    content: "We tested multiple file sharing solutions. FileShare Pro's encryption and compliance features won us over. Perfect for enterprise use.",
    rating: 5,
    initials: "DK"
  },
  {
    id: 5,
    name: "Jessica Martinez",
    role: "Marketing Lead",
    company: "Brand Agency",
    content: "The nearby share feature is a game-changer for our team meetings. Instant file transfers without email hassle!",
    rating: 5,
    initials: "JM"
  },
  {
    id: 6,
    name: "Alex Thompson",
    role: "Developer",
    company: "Code Factory",
    content: "Clean interface, fast uploads, and great API. Everything a developer could want in a file sharing platform.",
    rating: 5,
    initials: "AT"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="mb-16 sm:mb-24">
      <div className="text-center mb-12 sm:mb-16 animate-fade-in">
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Loved by Thousands
          </span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See what our users are saying about their experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {testimonials.map((testimonial, index) => (
          <Card
            key={testimonial.id}
            className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6 sm:p-8 space-y-4">
              {/* Rating */}
              <div className="flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-warning text-warning"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-primary-glow">
                  <AvatarFallback className="bg-transparent text-primary-foreground font-semibold">
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
