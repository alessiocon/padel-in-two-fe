import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

export function CardClubSkeleton() {
  return (
    <Card className="w-[350px] bg-card border-primary/20 py-5 gap-4">
      {/* Header Skeleton */}
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <CardDescription className="flex items-center gap-2 text-xs pt-1">
          <Skeleton className="h-4 w-1/2" />
        </CardDescription>
      </CardHeader>

      {/* Content Skeleton */}
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      {/* Footer Skeleton */}
      <CardFooter className="flex justify-between items-center gap-2">
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </CardFooter>

      {/* Promo Banner Skeleton */}
      <CardDescription className="bg-primary/10 p-2.5 flex items-center gap-2 px-3">
        <Skeleton className="h-4 w-4 rounded-full shrink-0" />
        <Skeleton className="h-3 w-full" />
      </CardDescription>
    </Card>
  );
}