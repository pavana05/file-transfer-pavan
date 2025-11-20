import React, { useState, useEffect, ReactNode } from 'react';

interface LoadingWrapperProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  minLoadingTime?: number; // Minimum time to show skeleton (ms)
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  skeleton,
  children,
  minLoadingTime = 0
}) => {
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldShowSkeleton(true);
    } else if (minLoadingTime > 0) {
      const timer = setTimeout(() => {
        setShouldShowSkeleton(false);
      }, minLoadingTime);
      return () => clearTimeout(timer);
    } else {
      setShouldShowSkeleton(false);
    }
  }, [isLoading, minLoadingTime]);

  return <>{shouldShowSkeleton ? skeleton : children}</>;
};
