import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FileListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      {[1, 2, 3].map((i) => (
        <Card 
          key={i}
          className="p-8 bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col lg:flex-row gap-8">
            {/* File Info Skeleton */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex flex-wrap gap-4">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>

              {/* Share Links Skeleton */}
              <div className="space-y-4">
                {/* PIN Skeleton */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-32 rounded-xl" />
                  <Skeleton className="h-11 w-11 rounded-xl" />
                </div>

                {/* Share URL Skeleton */}
                <div className="flex items-center gap-3">
                  <Skeleton className="flex-1 h-14 rounded-2xl" />
                  <Skeleton className="h-11 w-11 rounded-xl" />
                  <Skeleton className="h-11 w-11 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex lg:flex-col gap-3 lg:w-36">
              <Skeleton className="flex-1 lg:w-full h-12 rounded-xl" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
