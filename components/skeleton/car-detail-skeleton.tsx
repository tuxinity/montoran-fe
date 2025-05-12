import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function CarDetailSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-96 w-full" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-20" />
            ))}
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ))}
          </div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}
