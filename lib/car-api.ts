import { COLLECTIONS } from "./constants";
import { ClientResponseError } from "pocketbase";
import type { Car, Model, Brand, BodyType } from "@/types/car";
import type {
  ICarAPI,
  GetCarsOptions,
  GetCarByIdOptions,
  CreateCarRequest,
  CreateModelRequest,
  CreateBrandRequest,
  CreateBodyTypeRequest,
} from "@/types/api";
import { createPocketBase, getClientPB, pb } from "./pocketbase";

export const CarApi: ICarAPI = {
  getCars: async ({ search, filters }: GetCarsOptions = {}): Promise<Car[]> => {
    try {
      const filterRules = ["is_sold = false"];

      if (search) {
        filterRules.push(`model.name ~ "${search}"`);
      }

      if (filters?.brand) {
        filterRules.push(`model.brand = "${filters.brand}"`);
      }

      if (filters?.bodyType) {
        filterRules.push(`model.body_type = "${filters.bodyType}"`);
      }

      if (filters?.transmission) {
        filterRules.push(`transmission = "${filters.transmission}"`);
      }

      if (filters?.minPrice) {
        filterRules.push(`sell_price >= ${filters.minPrice}`);
      }

      if (filters?.maxPrice) {
        filterRules.push(`sell_price <= ${filters.maxPrice}`);
      }

      if (filters?.soldStatus === "sold") {
        filterRules.push(`is_sold = true`);
      }

      const records = await pb.collection("cars").getFullList<Car>({
        sort: "-created",
        expand: "model.brand,model.body_type",
        filter: filterRules.length > 0 ? filterRules.join(" && ") : undefined,
        $autoCancel: false,
      });

      return records;
    } catch (error) {
      if (error instanceof Error) {
        console.error("PocketBase filter error:", error.message);
      }
      throw error;
    }
  },
  getCarById: async ({ id }: GetCarByIdOptions): Promise<Car> => {
    try {
      const record = await pb.collection("cars").getOne<Car>(id, {
        expand: "model.body_type,model.brand",
        $autoCancel: false,
      });

      if (!record) {
        throw new Error(`Car with ID ${id} not found`);
      }

      return record;
    } catch (error) {
      if (error instanceof ClientResponseError) {
        if (error.status === 404) {
          throw new Error(`Car with ID ${id} not found`);
        }
        throw new Error(`Failed to fetch car: ${error.message}`);
      }
      throw error;
    }
  },

  getModels: async (): Promise<Model[]> => {
    try {
      const records = await pb.collection("model").getFullList<Model>({
        expand: "brand,body_type",
        $autoCancel: false,
      });
      return records;
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  },

  getBrands: async (): Promise<Brand[]> => {
    try {
      const records = await pb.collection("brand").getFullList<Brand>({
        $autoCancel: false,
      });
      return records;
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
  },

  getBodyTypes: async (): Promise<BodyType[]> => {
    try {
      const records = await pb.collection("body_type").getFullList<BodyType>({
        $autoCancel: false,
      });
      return records;
    } catch (error) {
      console.error("Error fetching body types:", error);
      throw error;
    }
  },

  createCar: async (data: FormData | CreateCarRequest): Promise<Car> => {
    try {
      if (data instanceof FormData) {
        return await createCarFromFormData(data);
      } else {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === "images" && Array.isArray(value)) {
            value.forEach((file) => formData.append("images", file));
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        return await createCarFromFormData(formData);
      }
    } catch (error) {
      console.error("Error creating car:", error);
      throw error;
    }
  },

  createModel: async (data: CreateModelRequest): Promise<Model> => {
    try {
      return await pb.collection(COLLECTIONS.MODELS).create<Model>(data);
    } catch (error) {
      console.error("Error creating model:", error);
      throw error;
    }
  },

  createBrand: async (data: CreateBrandRequest): Promise<Brand> => {
    try {
      return await pb.collection(COLLECTIONS.BRANDS).create<Brand>(data);
    } catch (error) {
      console.error("Error creating brand:", error);
      throw error;
    }
  },

  createBodyType: async (data: CreateBodyTypeRequest): Promise<BodyType> => {
    try {
      return await pb.collection(COLLECTIONS.BODY_TYPES).create<BodyType>(data);
    } catch (error) {
      console.error("Error creating body type:", error);
      throw error;
    }
  },

  updateCar: async (
    id: string,
    data: FormData | Partial<CreateCarRequest>
  ): Promise<Car> => {
    try {
      if (data instanceof FormData) {
        return await updateCarFromFormData(id, data);
      } else {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === "images" && Array.isArray(value)) {
            value.forEach((file) => formData.append("images", file));
          } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
          }
        });
        return await updateCarFromFormData(id, formData);
      }
    } catch (error) {
      console.error("Error updating car:", error);
      throw error;
    }
  },

  updateModel: async (
    id: string,
    data: Partial<CreateModelRequest>
  ): Promise<Model> => {
    try {
      return await pb.collection(COLLECTIONS.MODELS).update<Model>(id, data);
    } catch (error) {
      console.error("Error updating model:", error);
      throw error;
    }
  },

  updateBrand: async (
    id: string,
    data: Partial<CreateBrandRequest>
  ): Promise<Brand> => {
    try {
      return await pb.collection(COLLECTIONS.BRANDS).update<Brand>(id, data);
    } catch (error) {
      console.error("Error updating brand:", error);
      throw error;
    }
  },

  updateBodyType: async (
    id: string,
    data: Partial<CreateBodyTypeRequest>
  ): Promise<BodyType> => {
    try {
      return await pb
        .collection(COLLECTIONS.BODY_TYPES)
        .update<BodyType>(id, data);
    } catch (error) {
      console.error("Error updating body type:", error);
      throw error;
    }
  },

  deleteCar: async (id: string): Promise<boolean> => {
    try {
      await pb.collection(COLLECTIONS.CARS).delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting car:", error);
      throw error;
    }
  },

  deleteModel: async (id: string): Promise<boolean> => {
    try {
      await pb.collection(COLLECTIONS.MODELS).delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting model:", error);
      throw error;
    }
  },

  deleteBrand: async (id: string): Promise<boolean> => {
    try {
      await pb.collection(COLLECTIONS.BRANDS).delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting brand:", error);
      throw error;
    }
  },

  deleteBodyType: async (id: string): Promise<boolean> => {
    try {
      await pb.collection(COLLECTIONS.BODY_TYPES).delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting body type:", error);
      throw error;
    }
  },

  getImageUrl: (record: Car, filename: string): string => {
    return pb.files.getURL(record, filename);
  },

  isLoggedIn: (): boolean => {
    // On the server, we can't reliably check login status
    if (typeof window === "undefined") {
      return false;
    }

    // On the client, use the client PocketBase instance
    const clientPB = getClientPB();
    return clientPB ? clientPB.authStore.isValid : false;
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ token: string; user: { id: string; email: string } }> => {
    try {
      // Use client-side PocketBase instance
      const clientPB = getClientPB();
      if (!clientPB) {
        throw new Error("Cannot login on server side");
      }

      const authData = await clientPB
        .collection("users")
        .authWithPassword(email, password);

      // Set cookie directly with document.cookie (client-side only)
      if (typeof window !== "undefined") {
        const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
        document.cookie = `pb_auth=${clientPB.authStore.token}; ${secure} SameSite=Strict; Path=/`;
      }

      return {
        token: authData.token,
        user: {
          id: authData.record.id,
          email: authData.record.email,
        },
      };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  logout: () => {
    // Use client-side PocketBase instance
    const clientPB = getClientPB();
    if (!clientPB) {
      console.warn("Cannot logout on server side");
      return;
    }

    clientPB.authStore.clear();

    // Remove cookie directly with document.cookie (client-side only)
    if (typeof window !== "undefined") {
      document.cookie = "pb_auth=; Max-Age=0; Path=/";
    }
  },

  getPocketBase: () => {
    // Return the appropriate PocketBase instance based on environment
    if (typeof window === "undefined") {
      // Server-side: create a new instance
      return createPocketBase();
    } else {
      // Client-side: use the singleton instance
      const clientPB = getClientPB();
      if (!clientPB) {
        // This should not happen in practice, but we need to handle it for TypeScript
        return createPocketBase(); // Fallback to a new instance
      }
      return clientPB;
    }
  },
};

async function createCarFromFormData(formData: FormData): Promise<Car> {
  try {
    let brand = await pb
      .collection(COLLECTIONS.BRANDS)
      .getFirstListItem(`name = "${formData.get("brand")}"`)
      .catch(() => null);

    if (!brand) {
      brand = await pb.collection(COLLECTIONS.BRANDS).create({
        name: formData.get("brand") as string,
      });
    }

    let bodyType = await pb
      .collection(COLLECTIONS.BODY_TYPES)
      .getFirstListItem(`name = "${formData.get("body_type")}"`)
      .catch(() => null);

    if (!bodyType) {
      bodyType = await pb.collection(COLLECTIONS.BODY_TYPES).create({
        name: formData.get("body_type") as string,
      });
    }

    let model = await pb
      .collection(COLLECTIONS.MODELS)
      .getFirstListItem(`name = "${formData.get("model")}"`)
      .catch(() => null);

    if (!model) {
      model = await pb.collection(COLLECTIONS.MODELS).create({
        name: formData.get("model") as string,
        brand: brand?.id,
        body_type: bodyType?.id,
        seats: formData.get("seats") || 0,
        cc: formData.get("cc") || 0,
        bags: formData.get("bags") || 0,
      });
    }

    const carData: CreateCarRequest = {
      model: model?.id ?? "",
      body_type: bodyType?.id,
      year: Number(formData.get("year")),
      condition: Number(formData.get("condition")),
      mileage: Number(formData.get("mileage")),
      buy_price: Number(formData.get("buy_price")),
      sell_price: Number(formData.get("sell_price")),
      transmission: formData.get("transmission") as "Automatic" | "Manual",
      description: formData.get("description") as string,
    };

    const newImages = formData.getAll("images");
    if (newImages.length > 0 && newImages[0] instanceof File) {
      carData.images = newImages as File[];
    }

    return await pb.collection(COLLECTIONS.CARS).create<Car>(carData);
  } catch (error) {
    console.error("Error creating car:", error);
    throw error;
  }
}

async function updateCarFromFormData(
  id: string,
  formData: FormData
): Promise<Car> {
  try {
    let brand = await pb
      .collection(COLLECTIONS.BRANDS)
      .getFirstListItem(`name = "${formData.get("brand")}"`)
      .catch(() => null);

    if (!brand) {
      brand = await pb.collection(COLLECTIONS.BRANDS).create({
        name: formData.get("brand") as string,
      });
    }

    let bodyType = await pb
      .collection(COLLECTIONS.BODY_TYPES)
      .getFirstListItem(`name = "${formData.get("body_type")}"`)
      .catch(() => null);

    if (!bodyType) {
      bodyType = await pb.collection(COLLECTIONS.BODY_TYPES).create({
        name: formData.get("body_type") as string,
      });
    }

    let model = await pb
      .collection(COLLECTIONS.MODELS)
      .getFirstListItem(`name = "${formData.get("model")}"`)
      .catch(() => null);

    if (!model) {
      model = await pb.collection(COLLECTIONS.MODELS).create({
        name: formData.get("model") as string,
        brand: brand?.id,
        body_type: bodyType?.id,
        seats: formData.get("seats") || 0,
        cc: formData.get("cc") || 0,
        bags: formData.get("bags") || 0,
      });
    }

    const carData: Record<string, unknown> = {
      model: model?.id,
      body_type: bodyType?.id,
      year: formData.get("year"),
      condition: formData.get("condition"),
      mileage: formData.get("mileage"),
      buy_price: formData.get("buy_price"),
      sell_price: formData.get("sell_price"),
      transmission: formData.get("transmission"),
      description: formData.get("description"),
    };

    const newImages = formData.getAll("images");
    if (newImages.length > 0 && newImages[0] instanceof File) {
      carData.images = newImages;
    }

    return await pb.collection(COLLECTIONS.CARS).update<Car>(id, carData);
  } catch (error) {
    console.error("Error updating car:", error);
    throw error;
  }
}

export default CarApi;
