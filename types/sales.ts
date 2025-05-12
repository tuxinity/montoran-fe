import { Car, User } from "./car";

export type Sale = {
  id: string;
  car: string;
  customer_name: string;
  price: number;
  payment_method: string;
  notes?: string;
  description?: string;
  created?: string;
  updated?: string;
  created_by: string;
  deleted_by?: string;
  deleted_at?: string;
  expand?: {
    car: Car;
    created_by?: User;
    deleted_by?: User;
  };
};
