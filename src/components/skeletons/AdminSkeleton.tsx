import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AdminHeaderSkeleton = () => {
  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>
    </header>
  );
};

export const AdminStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const AdminChartSkeleton = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
      
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
};

export const AdminTabsSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-10 w-28 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
};

export const AdminTableSkeleton = () => {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table Header */}
          <div className="flex gap-4 pb-3 border-b border-border/50">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex gap-4 py-3 border-b border-border/30">
              {[1, 2, 3, 4, 5].map((col) => (
                <Skeleton key={col} className="h-5 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const AdminFullSkeleton = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/8 to-transparent rounded-full blur-3xl" />
      </div>

      <AdminHeaderSkeleton />

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <AdminStatsSkeleton />
          <AdminTabsSkeleton />
          <AdminChartSkeleton />
          <AdminTableSkeleton />
        </div>
      </main>
    </div>
  );
};
