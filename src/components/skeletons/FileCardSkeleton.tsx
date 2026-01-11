import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface FileCardSkeletonProps {
  className?: string;
}

export const FileCardSkeleton: React.FC<FileCardSkeletonProps> = ({ className }) => {
  return (
    <Card className={cn(
      "p-3 sm:p-6 animate-pulse transition-all duration-300 border border-border/50 bg-background/80 backdrop-blur-sm rounded-xl",
      className
    )}>
      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-col sm:flex-row">
        {/* Mobile Layout: Icon and Actions Row */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          {/* File Icon Skeleton */}
          <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex-shrink-0" />
          
          {/* Mobile Action Buttons Skeleton */}
          <div className="flex items-center gap-1 sm:hidden">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>

        {/* File Info Skeleton */}
        <div className="flex-1 min-w-0 w-full sm:w-auto space-y-3">
          {/* Title and Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-5 w-40 sm:w-56 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          
          {/* File Meta Info */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-24 rounded hidden xs:block" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>

          {/* Progress Bar Skeleton (simulates upload in progress) */}
          <div className="mt-3 p-4 rounded-xl bg-muted/20 border border-border/40 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-6 w-12 rounded" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </div>
        </div>

        {/* Desktop Action Buttons Skeleton */}
        <div className="hidden sm:flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </Card>
  );
};

interface FileCardSkeletonListProps {
  count?: number;
  className?: string;
}

export const FileCardSkeletonList: React.FC<FileCardSkeletonListProps> = ({ 
  count = 3,
  className 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <FileCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Compact skeleton for grid view
export const FileCardSkeletonCompact: React.FC<FileCardSkeletonProps> = ({ className }) => {
  return (
    <Card className={cn(
      "p-4 animate-pulse border border-border/50 bg-background/80 rounded-xl",
      className
    )}>
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Icon */}
        <Skeleton className="w-16 h-16 rounded-xl" />
        
        {/* File Name */}
        <Skeleton className="h-4 w-24 rounded" />
        
        {/* File Size */}
        <Skeleton className="h-3 w-16 rounded" />
        
        {/* Status Badge */}
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </Card>
  );
};

export const FileCardSkeletonGrid: React.FC<FileCardSkeletonListProps> = ({ 
  count = 6,
  className 
}) => {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <FileCardSkeletonCompact key={index} />
      ))}
    </div>
  );
};

export default FileCardSkeleton;
