"use client";

import { useQuery } from "@tanstack/react-query";
import CarApi from "@/lib/car-api";
import { GetCarsOptions } from "@/types/api";

export const carKeys = {
  all: ["cars"] as const,
  lists: () => [...carKeys.all, "list"] as const,
  list: (options?: GetCarsOptions) => [...carKeys.lists(), options] as const,
  details: () => [...carKeys.all, "detail"] as const,
  detail: (id: string) => [...carKeys.details(), id] as const,
};

export function useAvailableCars(options?: GetCarsOptions) {
  const enhancedOptions: GetCarsOptions = {
    ...options,
    filters: {
      ...options?.filters,
      soldStatus: "available",
    },
  };

  return useQuery({
    queryKey: carKeys.list(enhancedOptions),
    queryFn: () => CarApi.getCars(enhancedOptions),
  });
}

export function useCar(id: string) {
  return useQuery({
    queryKey: carKeys.detail(id),
    queryFn: () => CarApi.getCarById({ id }),
    enabled: !!id,
  });
}
