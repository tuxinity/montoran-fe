"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, GaugeCircle } from "lucide-react";
import type { Car } from "@/types/car";
import CarApi from "@/lib/car-api";
import { idrFormat } from "@/utils/idr-format";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  const bodyType = car.expand?.model.expand?.body_type.name;
  const modelName = car.expand?.model.name;
  const imageUrl = car.images?.[0]
    ? CarApi.getImageUrl(car, car.images[0])
    : null;

  return (
    <Link
      href={`/car/${car.id}`}
      aria-label={`View details for ${modelName}`}
      prefetch={false}
    >
      <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg">
        <CardHeader className="p-0 space-y-0 relative">
          {bodyType && (
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 z-10 bg-white/90 text-black hover:bg-white uppercase text-xs"
            >
              {bodyType}
            </Badge>
          )}

          {car.is_sold && (
            <Badge
              variant="destructive"
              className="absolute right-3 top-3 z-10 bg-red-500 text-white font-bold hover:bg-red-600"
            >
              SOLD OUT
            </Badge>
          )}
          {imageUrl && (
            <div className="overflow-hidden aspect-[4/3]">
              <Image
                src={imageUrl}
                alt={`${modelName || "Car"} image`}
                width={512}
                height={384}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                priority={false}
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {modelName && (
            <h3 className="font-semibold text-lg tracking-tight capitalize line-clamp-1">
              {modelName}
            </h3>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <GaugeCircle className="w-4 h-4" aria-hidden="true" />
              <span>{car.transmission}</span>
            </div>
            {car.expand?.model.seats && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>{car.expand.model.seats} Seats</span>
              </div>
            )}
            {car.expand?.model.bags && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                <span>{car.expand.model.bags} bags</span>
              </div>
            )}
          </div>

          <div className="pt-2 space-y-1">
            <p className="text-sm text-muted-foreground">Start from</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {idrFormat(car.sell_price)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
