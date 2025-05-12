"use client";

import { useEffect, useState, useCallback } from "react";
import CarApi from "@/lib/car-api";
import { CarCard } from "./card";
import type { Car, FilterValues } from "@/types/car";
import { CarFilters } from "@/components/car-filters";
import { CarListSkeleton } from "./skeleton/car-list-skeleton";
import { useTranslation } from "react-i18next";

interface CarListProps {
  className?: string;
  initialCars: Car[];
}

export function CarList({ initialCars, className }: CarListProps) {
  const { t } = useTranslation();
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [search, setSearch] = useState<string>("");

  const loadCars = useCallback(
    async (searchValue: string, filterValues: FilterValues) => {
      setIsLoading(true);
      try {
        const updatedCars = await CarApi.getCars({
          search: searchValue.trim(),
          filters: filterValues,
        });
        setCars(updatedCars);
      } catch (error) {
        console.error("Error loading cars:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      loadCars(value, filters);
    },
    [filters, loadCars]
  );

  const handleFilterChange = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters);
      loadCars(search, newFilters);
    },
    [search, loadCars]
  );

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === "undefined") return;

    const pb = CarApi.getPocketBase();
    if (!pb) return;

    let unsubscribe: (() => void) | undefined;

    // Set up subscription
    const setupSubscription = async () => {
      try {
        const sub = await pb.collection("cars").subscribe("*", async () => {
          loadCars(search, filters);
        });
        unsubscribe = sub;
      } catch (error) {
        console.error("Error setting up PocketBase subscription:", error);
      }
    };

    setupSubscription();

    return () => {
      unsubscribe?.();
    };
  }, [search, filters, loadCars]);

  return (
    <div className={className}>
      <CarFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {isLoading ? (
          <CarListSkeleton />
        ) : cars.length > 0 ? (
          cars.map((car) => <CarCard key={car.id} car={car} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("car.list.empty")}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {search || Object.keys(filters).length > 0
                ? t("car.list.empty_filtered")
                : t("car.list.empty_all")}
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary text-white px-6 py-3 text-sm font-medium shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t("car.list.contact")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
