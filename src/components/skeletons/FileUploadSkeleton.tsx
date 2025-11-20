import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FileUploadSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Tabs skeleton */}
      <div className="flex gap-2 border-b border-border">
        <Skeleton className="h-10 w-32 rounded-t-lg" />
        <Skeleton className="h-10 w-32 rounded-t-lg" />
      </div>

      {/* Upload zone skeleton */}
      <Card className="border-2 border-dashed border-border/50">
        <div className="p-12 text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="flex gap-3 justify-center">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </Card>

      {/* File list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded" />
                <Skeleton className="h-9 w-9 rounded" />
              </div>
            </div>
            <div className="mt-3">
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </Card>
        ))}
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
