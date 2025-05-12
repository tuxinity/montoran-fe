"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomersApi } from "@/lib/customers-api";
import { Customer, CustomerFilter, SortConfig } from "@/types/customer";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters?: CustomerFilter, sort?: SortConfig) =>
    [...customerKeys.lists(), { filters, sort }] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export function useCustomers(filters?: CustomerFilter, sort?: SortConfig) {
  return useQuery({
    queryKey: customerKeys.list(filters, sort),
    queryFn: () => CustomersApi.getCustomers(filters, sort),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Pick<Customer, "name" | "phone" | "email" | "address">
    ) => CustomersApi.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deletedBy }: { id: string; deletedBy: string }) =>
      CustomersApi.deleteCustomer(id, deletedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
