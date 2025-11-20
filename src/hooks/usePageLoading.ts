import { useState, useEffect } from 'react';

/**
 * Custom hook to manage page loading states with minimum display time
 * @param isLoading - Current loading state
 * @param minLoadingTime - Minimum time to show loading state (ms)
 * @returns Boolean indicating if loading state should be shown
 */
export const usePageLoading = (isLoading: boolean, minLoadingTime: number = 500) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && startTime === null) {
      setStartTime(Date.now());
      setShowLoading(true);
    } else if (!isLoading && startTime !== null) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);

      const timer = setTimeout(() => {
        setShowLoading(false);
        setStartTime(null);
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [isLoading, startTime, minLoadingTime]);

  return showLoading;
};
