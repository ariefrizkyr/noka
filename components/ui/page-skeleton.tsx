import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PageSkeletonProps {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  showTabs?: boolean;
  showCards?: boolean;
  cardCount?: number;
}

export function PageSkeleton({ 
  title, 
  icon: Icon, 
  showTabs = false, 
  showCards = true,
  cardCount = 3 
}: PageSkeletonProps) {
  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6 text-blue-600" />}
            {title ? (
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            ) : (
              <Skeleton className="h-7 w-32" />
            )}
          </div>
        </div>

        {/* Cards/Content skeleton */}
        {showCards && (
          <div className="space-y-4">
            {Array.from({ length: cardCount }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs skeleton */}
        {showTabs && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}