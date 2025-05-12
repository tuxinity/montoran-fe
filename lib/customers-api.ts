import { pb } from "./pocketbase";
import { COLLECTIONS } from "./constants";
import { Customer, CustomerFilter, SortConfig } from "@/types/customer";

export class CustomersApi {
  static async getCustomers(filters?: CustomerFilter, sort?: SortConfig) {
    try {
      const records = await pb
        .collection(COLLECTIONS.CUSTOMERS)
        .getFullList<Customer>({
          sort: sort
            ? `${sort.direction === "desc" ? "-" : ""}${sort.field}`
            : "-created",
          filter: filters?.search
            ? `(name ~ "${filters.search}" || phone ~ "${filters.search}") && deleted_at = null`
            : "deleted_at = null",
          $autoCancel: false,
        });
      return records;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  }

  static async checkPhoneExists(phone: string): Promise<boolean> {
    try {
      const records = await pb
        .collection(COLLECTIONS.CUSTOMERS)
        .getFullList<Customer>({
          filter: `phone = "${phone}" && deleted_at = null`,
          $autoCancel: false,
        });
      return records.length > 0;
    } catch (error) {
      console.error("Error checking phone number:", error);
      throw error;
    }
  }

  static async createCustomer(
    data: Pick<Customer, "name" | "phone" | "email" | "address">
  ) {
    try {
      const phoneExists = await this.checkPhoneExists(data.phone);
      if (phoneExists) {
        throw new Error("Phone number already exists");
      }

      const record = await pb
        .collection(COLLECTIONS.CUSTOMERS)
        .create<Customer>(data);
      return record;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  static async deleteCustomer(id: string, deletedBy: string) {
    try {
      const record = await pb
        .collection(COLLECTIONS.CUSTOMERS)
        .update<Customer>(id, {
          deleted_at: new Date().toISOString(),
          deleted_by: deletedBy,
        });
      return record;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }
}
