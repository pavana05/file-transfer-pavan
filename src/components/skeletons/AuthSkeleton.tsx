import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AuthFormSkeleton = () => {
  return (
    <Card className="border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <Skeleton className="flex-1 h-10 rounded-lg" />
          </div>

          {/* Form Header */}
          <div className="text-center space-y-2">
            <Skeleton className="h-14 w-14 mx-auto rounded-2xl" />
            <Skeleton className="h-7 w-40 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <Skeleton className="flex-1 h-px" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="flex-1 h-px" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>

          {/* Submit Button */}
          <Skeleton className="h-14 w-full rounded-xl" />

          {/* Footer Link */}
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
};

export const AuthPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 via-primary/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-accent/12 via-accent/6 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/40 backdrop-blur-xl border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen pt-20">
        {/* Left Panel - Hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className="max-w-lg space-y-12">
            <div className="flex justify-center">
              <Skeleton className="w-28 h-28 rounded-[2rem]" />
            </div>
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-6 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <AuthFormSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};
