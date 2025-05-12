import { RecordModel } from "pocketbase";

export interface Customer extends RecordModel {
  name: string;
  email: string;
  phone: string;
  address: string;
  created: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface CustomerFilter {
  search?: string;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}
