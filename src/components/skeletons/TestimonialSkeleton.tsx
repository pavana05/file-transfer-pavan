import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TestimonialCardSkeleton = () => {
  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        {/* Rating stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-5" />
          ))}
        </div>
        
        {/* Testimonial text */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Author info */}
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export const TestimonialSectionSkeleton = () => {
  return (
    <div className="mb-20">
      <div className="text-center mb-12 max-w-3xl mx-auto space-y-4">
        <div className="flex justify-center">
          <Skeleton className="h-7 w-48 rounded-full" />
        </div>
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-2/3 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <TestimonialCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
