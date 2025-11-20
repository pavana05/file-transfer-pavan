import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardHeaderSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
};

export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  );
};

export const DashboardTableSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Table header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <Skeleton className="h-5 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Table rows */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border/50">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export const DashboardFullSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeaderSkeleton />
        <DashboardStatsSkeleton />
        <DashboardTableSkeleton />
      </div>
    </div>
  );
};
