import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import CarApi from "@/lib/car-api";
import { CarDetail } from "@/components/car-detail";
import { CarDetailSkeleton } from "@/components/skeleton/car-detail-skeleton";
import { RelevantCars } from "@/components/car/relevant-cars";
import { getOgImageUrl } from "@/lib/og";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await CarApi.getCarById({ id });

  if (!car) {
    return {
      title: "Car Not Found",
    };
  }

  const title = `${car.expand?.model.expand?.brand.name} ${car.expand?.model.name}`;
  const description =
    car.description ||
    `${car.year} ${car.expand?.model.expand?.brand.name} ${car.expand?.model.name} - Find your perfect car on Montoran`;
  const ogImage = CarApi.getImageUrl(car, car.images[0]);

  const ogImageUrl = getOgImageUrl({
    title,
    description,
    image: ogImage,
  });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params;
  const car = await CarApi.getCarById({ id });

  if (!car) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<CarDetailSkeleton />}>
        <CarDetail data={car} />
        <RelevantCars currentCar={car} />
      </Suspense>
    </main>
  );
}
