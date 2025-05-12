export interface PocketBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export interface BodyType
  extends Omit<PocketBaseRecord, "created" | "updated"> {
  name: string;
}

export interface Brand
  extends Omit<
    PocketBaseRecord,
    "collectionId" | "collectionName" | "created" | "updated"
  > {
  name: string;
}

export interface Model extends Omit<PocketBaseRecord, "created" | "updated"> {
  name: string;
  brand: string;
  body_type: string;
  seats: number;
  cc: number;
  bags: number;
  expand?: {
    body_type: BodyType;
    brand: Brand;
  };
}

export interface Car extends PocketBaseRecord {
  model: string;
  body_type?: string;
  condition: number;
  transmission: "Automatic" | "Manual";
  mileage: number;
  buy_price: number;
  sell_price: number;
  year: number;
  description: string;
  images: string[];
  is_sold: boolean;
  expand?: {
    model: Model & {
      expand?: {
        body_type: BodyType;
        brand: Brand;
      };
    };
  };
}

export interface User extends PocketBaseRecord {
  email: string;
  emailVisibility: boolean;
  username: string;
  verified: boolean;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface FilterValues {
  brand?: string;
  bodyType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  soldStatus?: "all" | "available" | "sold";
}

export interface CreateCarRequest {
  model: string;
  condition: number;
  transmission: "Automatic" | "Manual";
  mileage: number;
  buy_price: number;
  sell_price: number;
  year: number;
  description: string;
}

export interface CreateModelRequest {
  name: string;
  brand: string;
  body_type: string;
  seats: number;
  cc: number;
  bags: number;
}

export interface CarFormData {
  model: string;
  year: number | null;
  condition: number | null;
  mileage: number | null;
  buy_price: number | null;
  sell_price: number | null;
  transmission: string | null;
  description: string | null;
  images?: File[] | FormDataEntryValue[];
}

export type ModelWithExpand = Model & Required<Pick<Model, "expand">>;

export type CarWithExpand = Car & Required<Pick<Car, "expand">>;
export type CarWithFullExpand = Car & {
  expand: {
    model: Model & {
      expand: {
        body_type: BodyType;
        brand: Brand;
      };
    };
  };
};

export interface PocketBaseQueryParams {
  filter?: string;
  sort?: string;
  expand?: string;
  fields?: string;
  skipTotal?: boolean;
  page?: number;
  perPage?: number;
  $autoCancel?: boolean;
  $cancelKey?: string;
}
