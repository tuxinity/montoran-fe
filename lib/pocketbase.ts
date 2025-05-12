import PocketBase from "pocketbase";

const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;

if (!pocketbaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_POCKETBASE_URL is not defined in environment variables"
  );
}

// Create a PocketBase instance for server-side
export const createPocketBase = () => new PocketBase(pocketbaseUrl);

// Create a singleton instance for client-side only
let clientPB: PocketBase | null = null;

// This function ensures we don't create the PocketBase instance on the server
export const getClientPB = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!clientPB) {
    clientPB = new PocketBase(pocketbaseUrl);

    // Try to load auth from cookie if available
    try {
      const authCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("pb_auth="));

      if (authCookie) {
        const token = authCookie.split("=")[1];
        if (token) {
          clientPB.authStore.save(token);
        }
      }
    } catch (e) {
      console.error("Error loading auth from cookie:", e);
    }
  }

  return clientPB;
};

// For server-side rendering, create a new instance each time
export const pb =
  typeof window === "undefined"
    ? createPocketBase()
    : (getClientPB() as PocketBase);
