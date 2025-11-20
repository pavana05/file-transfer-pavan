import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="hidden sm:block space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero section skeleton */}
        <div className="text-center mb-16 space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>
          <Skeleton className="h-14 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-14 w-4/5 max-w-xl mx-auto" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        </div>

        {/* Main content card skeleton */}
        <Card className="mb-20 p-8">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </div>
        </Card>

        {/* Feature grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
