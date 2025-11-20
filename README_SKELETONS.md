# Loading Skeleton System

This project includes a comprehensive loading skeleton system with beautiful shimmer effects for better perceived performance.

## Features

- **Shimmer Effect**: All skeleton components feature a smooth shimmer animation
- **Reusable Components**: Pre-built skeleton components for common UI patterns
- **Loading Wrapper**: Utility component to easily toggle between loading and loaded states
- **Page Loading Hook**: Custom hook to manage loading states with minimum display time

## Available Skeleton Components

### Basic Components

- `<Skeleton />` - Base skeleton component with shimmer effect

### Specialized Skeletons

Located in `src/components/skeletons/`:

- `<HeroSkeleton />` - For hero sections
- `<UploadCardSkeleton />` - For file upload areas
- `<FeatureCardSkeleton />` - For individual feature cards
- `<FeatureGridSkeleton />` - For feature card grids
- `<TestimonialCardSkeleton />` - For testimonial cards
- `<TestimonialSectionSkeleton />` - For full testimonial sections
- `<FileUploadSkeleton />` - For file upload managers
- `<DashboardHeaderSkeleton />` - For dashboard headers
- `<DashboardStatsSkeleton />` - For dashboard statistics
- `<DashboardTableSkeleton />` - For data tables
- `<DashboardFullSkeleton />` - For complete dashboard pages
- `<PageSkeleton />` - For full page loading states

## Usage Examples

### Basic Usage

```tsx
import { Skeleton } from '@/components/ui/skeleton';

function MyComponent({ isLoading, data }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  
  return <div>{data}</div>;
}
```

### With LoadingWrapper

```tsx
import { LoadingWrapper } from '@/components/LoadingWrapper';
import { FeatureCardSkeleton } from '@/components/skeletons';

function FeatureCard({ isLoading, feature }) {
  return (
    <LoadingWrapper 
      isLoading={isLoading}
      skeleton={<FeatureCardSkeleton />}
    >
      <Card>
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </Card>
    </LoadingWrapper>
  );
}
```

### With usePageLoading Hook

```tsx
import { usePageLoading } from '@/hooks/usePageLoading';
import { PageSkeleton } from '@/components/skeletons';

function MyPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Show skeleton for minimum 500ms even if data loads faster
  const showLoading = usePageLoading(isLoading, 500);
  
  useEffect(() => {
    fetchData().then(data => {
      setData(data);
      setIsLoading(false);
    });
  }, []);
  
  if (showLoading) {
    return <PageSkeleton />;
  }
  
  return <div>{/* Your content */}</div>;
}
```

### Custom Skeleton Layout

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

function CustomSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </Card>
  );
}
```

## Demo

Visit `/loading-demo` to see all skeleton components in action with live reload functionality.

## Customization

### Shimmer Animation

The shimmer effect is defined in `tailwind.config.ts`:

```ts
keyframes: {
  shimmer: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  }
},
animation: {
  shimmer: 'shimmer 2s infinite',
}
```

### Skeleton Styling

The base skeleton uses design tokens from `src/index.css`:

```css
.skeleton {
  background: hsl(var(--muted));
  /* Shimmer gradient overlay */
  background-gradient: linear-gradient(
    90deg,
    transparent,
    hsl(var(--background) / 0.6),
    transparent
  );
}
```

## Best Practices

1. **Match Content Shape**: Skeleton layout should match the actual content layout
2. **Use Consistent Timing**: Keep loading states visible for at least 300-500ms
3. **Provide Context**: Show skeleton for the entire section being loaded
4. **Avoid Jarring Transitions**: Use `LoadingWrapper` with `minLoadingTime` for smooth transitions
5. **Responsive Design**: Ensure skeletons are responsive like actual content

## Performance Tips

- Skeleton components are lightweight and optimized for performance
- Use `usePageLoading` hook to prevent flickering on fast loads
- Group multiple skeletons in a single component for better organization
- Lazy load skeleton components only when needed
