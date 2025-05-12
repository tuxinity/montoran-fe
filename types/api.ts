import { Car, Model, Brand, BodyType, FilterValues } from "@/types/car";
import type PocketBase from "pocketbase";
import { AuthModel } from "pocketbase";

export interface GetCarsOptions {
  search?: string;
  filters?: FilterValues;
}

export interface GetCarByIdOptions {
  id: string;
}

export interface GetModelsOptions {
  sort?: string;
  filter?: string;
}

export interface GetBrandsOptions {
  sort?: string;
  filter?: string;
}

export interface GetBodyTypesOptions {
  sort?: string;
  filter?: string;
}

export interface CreateCarRequest {
  model: string;
  body_type?: string;
  condition: number;
  transmission: "Automatic" | "Manual";
  mileage: number;
  buy_price: number;
  sell_price: number;
  year: number;
  description: string;
  images?: File[];
}

export interface CreateModelRequest {
  name: string;
  brand: string;
  body_type: string;
  seats?: number;
  cc?: number;
  bags?: number;
}

export interface CreateBrandRequest {
  name: string;
}

export interface CreateBodyTypeRequest {
  name: string;
}

export interface UpdateCarRequest extends Partial<CreateCarRequest> {
  id: string;
}

export interface UpdateModelRequest extends Partial<CreateModelRequest> {
  id: string;
}

export interface UpdateBrandRequest extends Partial<CreateBrandRequest> {
  id: string;
}

export interface UpdateBodyTypeRequest extends Partial<CreateBodyTypeRequest> {
  id: string;
}

export interface DeleteCarOptions {
  id: string;
}

export interface DeleteModelOptions {
  id: string;
}

export interface DeleteBrandOptions {
  id: string;
}

export interface DeleteBodyTypeOptions {
  id: string;
}

export interface ICarAPI {
  getCars: (options?: GetCarsOptions) => Promise<Car[]>;
  getCarById: (options: GetCarByIdOptions) => Promise<Car>;
  getModels: (options?: GetModelsOptions) => Promise<Model[]>;
  getBrands: (options?: GetBrandsOptions) => Promise<Brand[]>;
  getBodyTypes: (options?: GetBodyTypesOptions) => Promise<BodyType[]>;

  createCar: (data: FormData | CreateCarRequest) => Promise<Car>;
  createModel: (data: CreateModelRequest) => Promise<Model>;
  createBrand: (data: CreateBrandRequest) => Promise<Brand>;
  createBodyType: (data: CreateBodyTypeRequest) => Promise<BodyType>;

  updateCar: (
    id: string,
    data: FormData | Partial<CreateCarRequest>
  ) => Promise<Car>;
  updateModel: (
    id: string,
    data: Partial<CreateModelRequest>
  ) => Promise<Model>;
  updateBrand: (
    id: string,
    data: Partial<CreateBrandRequest>
  ) => Promise<Brand>;
  updateBodyType: (
    id: string,
    data: Partial<CreateBodyTypeRequest>
  ) => Promise<BodyType>;

  deleteCar: (id: string) => Promise<boolean>;
  deleteModel: (id: string) => Promise<boolean>;
  deleteBrand: (id: string) => Promise<boolean>;
  deleteBodyType: (id: string) => Promise<boolean>;

  getImageUrl: (record: Car, filename: string) => string;
  isLoggedIn: () => boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    token: string;
    user: {
      id: string;
      email: string;
    };
  }>;
  logout: () => void;
  getPocketBase: () => PocketBase;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface IAuthAPI {
  isLoggedIn: () => boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{
    token: string;
    user: {
      id: string;
      email: string;
    };
  }>;
  loginWithGoogle: () => Promise<string>;
  completeOAuthLogin: (
    provider: string,
    code: string,
    state: string,
    redirectUrl: string
  ) => Promise<{
    token: string;
    user: {
      id: string;
      email: string;
    };
  }>;
  logout: () => void;
  getCurrentUser: () => User | null;
  getPocketBase: () => PocketBase;
  onAuthStateChange: (
    callback: (token: string, model: AuthModel | null) => void
  ) => void;
}
