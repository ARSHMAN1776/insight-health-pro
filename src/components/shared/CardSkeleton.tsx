import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface CardSkeletonProps {
  showHeader?: boolean;
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showHeader = true,
  showAvatar = false,
  lines = 3,
  className = '',
}) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-4">
            {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={showHeader ? '' : 'pt-6'}>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 ${
                i === lines - 1 ? 'w-2/3' : i === 0 ? 'w-full' : 'w-4/5'
              }`} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Stats card skeleton for dashboard
export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Card className={`card-gradient ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-16 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
};

// Dashboard skeleton for patient dashboard
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <Skeleton className="h-48 w-full rounded-3xl" />
      
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      
      {/* Content area skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    </div>
  );
};

export default CardSkeleton;
