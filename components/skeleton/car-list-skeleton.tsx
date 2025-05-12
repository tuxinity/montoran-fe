interface CarListSkeletonProps {
  count?: number;
}

export function CarListSkeleton({ count = 4 }: CarListSkeletonProps) {
  return (
    <>
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border bg-white transition-all duration-300 hover:shadow-lg"
        >
          {/* Image placeholder */}
          <div className="aspect-[4/3] bg-gray-100 animate-pulse" />

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Title and subtitle */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-100 rounded-md animate-pulse w-3/4" />
              <div className="h-4 bg-gray-100 rounded-md animate-pulse w-1/2" />
            </div>

            {/* Specs */}
            <div className="flex gap-3">
              <div className="h-6 bg-gray-100 rounded-md animate-pulse w-20" />
              <div className="h-6 bg-gray-100 rounded-md animate-pulse w-20" />
            </div>

            {/* Price */}
            <div className="h-7 bg-gray-100 rounded-md animate-pulse w-32" />
          </div>
        </div>
      ))}
    </>
  );
}
