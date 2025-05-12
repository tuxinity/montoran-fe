import Link from "next/link";
import Image from "next/image";
import { Car } from "@/types/car";
import { CarApi } from "@/lib/car-api";
import { idrFormat } from "@/utils/idr-format";

interface RelevantCarsProps {
  currentCar: Car;
}

export async function RelevantCars({ currentCar }: RelevantCarsProps) {
  const bodyTypeId = currentCar.expand?.model.expand?.body_type.id;
  const brandId = currentCar.expand?.model.expand?.brand.id;

  if (!bodyTypeId || !brandId) {
    console.error("Missing body type or brand ID");
    return null;
  }

  const relevantCars = await CarApi.getCars({
    filters: {
      bodyType: bodyTypeId,
      brand: brandId,
    },
  });

  const filteredCars = relevantCars
    .filter((car) => car.id !== currentCar.id)
    .slice(0, 4);

  if (filteredCars.length === 0) {
    const bodyTypeCars = await CarApi.getCars({
      filters: {
        bodyType: bodyTypeId,
      },
    });

    const filteredBodyTypeCars = bodyTypeCars
      .filter((car) => car.id !== currentCar.id)
      .slice(0, 4);

    if (filteredBodyTypeCars.length === 0) return null;

    const bodyTypeName = currentCar.expand?.model.expand?.body_type.name || "";

    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 capitalize">
            Mobil {bodyTypeName} Lainnya
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBodyTypeCars.map((car) => (
              <Link
                key={car.id}
                href={`/car/${car.id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                  <Image
                    src={CarApi.getImageUrl(car, car.images[0])}
                    alt={`${car.expand?.model.expand?.brand.name} ${car.expand?.model.name}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {car.expand?.model.expand?.brand.name}{" "}
                    {car.expand?.model.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {car.year} • {car.transmission}
                  </p>
                  <p className="font-bold text-primary">
                    {idrFormat(car.sell_price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
