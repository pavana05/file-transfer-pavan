import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FeatureCardSkeleton = () => {
  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-6 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </Card>
  );
};

export const FeatureGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <FeatureCardSkeleton key={i} />
      ))}
    </div>
  );
};
