import { Skeleton } from '@/components/ui/skeleton';

export const HeroSkeleton = () => {
  return (
    <div className="text-center mb-16 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-center">
        <Skeleton className="h-7 w-40 rounded-full" />
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-14 w-full max-w-2xl mx-auto" />
        <Skeleton className="h-14 w-4/5 max-w-xl mx-auto" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        <Skeleton className="h-6 w-3/4 max-w-xl mx-auto" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
    </div>
  );
};
