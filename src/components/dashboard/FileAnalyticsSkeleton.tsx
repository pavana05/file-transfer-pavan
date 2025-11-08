import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FileAnalyticsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Stats Overview Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 bg-card/40 backdrop-blur-md border border-border/60">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <Card className="p-6 bg-card/40 backdrop-blur-md border border-border/60">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-9 w-48 rounded-lg" />
        </div>

        <Skeleton className="h-[350px] w-full rounded-lg" />
      </Card>
    </div>
  );
};
