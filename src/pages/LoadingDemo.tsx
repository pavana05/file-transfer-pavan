import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import {
  HeroSkeleton,
  UploadCardSkeleton,
  FeatureGridSkeleton,
  TestimonialSectionSkeleton,
  DashboardFullSkeleton
} from '@/components/skeletons';
import { LoadingWrapper } from '@/components/LoadingWrapper';

const LoadingDemo = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleReload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Loading Skeleton Demo</h1>
          <p className="text-muted-foreground mb-6">
            See the beautiful shimmer effects in action
          </p>
          <Button onClick={handleReload} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reload Skeletons
          </Button>
        </div>

        <div className="space-y-16">
          {/* Hero Skeleton */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Hero Section</h2>
            <LoadingWrapper isLoading={isLoading} skeleton={<HeroSkeleton />}>
              <Card className="p-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">Content Loaded!</h3>
                  <p className="text-muted-foreground">
                    This is where your hero content would appear
                  </p>
                </div>
              </Card>
            </LoadingWrapper>
          </section>

          {/* Upload Card Skeleton */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Upload Section</h2>
            <LoadingWrapper isLoading={isLoading} skeleton={<UploadCardSkeleton />}>
              <Card className="p-8">
                <h3 className="text-xl font-semibold mb-4">Upload Manager</h3>
                <p className="text-muted-foreground">Upload content loaded successfully</p>
              </Card>
            </LoadingWrapper>
          </section>

          {/* Feature Grid Skeleton */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Features Grid</h2>
            <LoadingWrapper isLoading={isLoading} skeleton={<FeatureGridSkeleton />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <h4 className="text-lg font-semibold mb-2">Feature {i + 1}</h4>
                    <p className="text-muted-foreground text-sm">Feature content here</p>
                  </Card>
                ))}
              </div>
            </LoadingWrapper>
          </section>

          {/* Testimonials Skeleton */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Testimonials</h2>
            <LoadingWrapper isLoading={isLoading} skeleton={<TestimonialSectionSkeleton />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <p className="text-muted-foreground mb-4">
                      "Great testimonial content would go here!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary" />
                      <div>
                        <p className="font-semibold">User {i + 1}</p>
                        <p className="text-xs text-muted-foreground">Customer</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </LoadingWrapper>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LoadingDemo;
