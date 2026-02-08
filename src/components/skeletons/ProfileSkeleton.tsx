import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfileHeaderSkeleton = () => {
  return (
    <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </header>
  );
};

export const ProfileInfoSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <div className="relative">
        <Skeleton className="w-24 h-24 rounded-3xl" />
      </div>
      <div className="flex-1 space-y-3">
        <Skeleton className="h-10 w-48" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </div>
  );
};

export const ProfileStatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ProfilePlanSkeleton = () => {
  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ProfilePurchasesSkeleton = () => {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ProfileFullSkeleton = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      <ProfileHeaderSkeleton />

      <main className="relative container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        <div className="space-y-8">
          <ProfileInfoSkeleton />
          <ProfileStatsSkeleton />
          <ProfilePlanSkeleton />
          <ProfilePurchasesSkeleton />
        </div>
      </main>
    </div>
  );
};
