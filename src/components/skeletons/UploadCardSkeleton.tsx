import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const UploadCardSkeleton = () => {
  return (
    <Card className="border shadow-lg bg-card">
      <div className="p-6 sm:p-8 lg:p-10 space-y-6">
        {/* Upload zone skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <div className="flex gap-2 justify-center">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>

        {/* File list skeleton */}
        <div className="space-y-3 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border/50">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
