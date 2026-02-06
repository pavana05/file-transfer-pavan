import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardHeaderSkeleton = () => {
  return (
    <header className="relative border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-20" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="hidden sm:block space-y-1">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>
    </header>
  );
};

export const DashboardTitleSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <Skeleton className="h-10 w-40" />
    </div>
  );
};

export const DashboardStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const DashboardAnalyticsSkeleton = () => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
};

export const DashboardSearchSkeleton = () => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="w-full sm:w-40 h-10" />
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardFileCardSkeleton = () => {
  return (
    <Card className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full flex-shrink-0" />
            </div>

            {/* Share Links */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-28 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="flex-1 h-12 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex lg:flex-col gap-2 lg:w-32">
            <Skeleton className="flex-1 lg:w-full h-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardFileListSkeleton = () => {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <DashboardFileCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DashboardFullSkeleton = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/8 to-transparent rounded-full blur-3xl" />
      </div>

      <DashboardHeaderSkeleton />

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="space-y-8">
          <DashboardTitleSkeleton />
          <DashboardStatsSkeleton />
          <DashboardAnalyticsSkeleton />
          <DashboardSearchSkeleton />
          <DashboardFileListSkeleton />
        </div>
      </main>
    </div>
  );
};
