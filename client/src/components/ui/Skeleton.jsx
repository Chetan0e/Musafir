import { clsx } from 'clsx';

const Skeleton = ({
  className = '',
  width,
  height,
  circle = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'animate-shimmer bg-gradient-to-r from-surface via-surface-2 to-surface',
        circle ? 'rounded-full' : 'rounded-md',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      {...props}
    />
  );
};

// Pre-built skeleton patterns
export const SkeletonCard = () => (
  <div className="bg-surface rounded-lg border border-border p-4 space-y-4">
    <Skeleton className="h-40 w-full rounded-lg" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-4"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonItinerary = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-surface-2 rounded-lg p-4 space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
