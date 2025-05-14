import PocketBase from "pocketbase";
import Cookies from "js-cookie";

const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;

if (!pocketbaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_POCKETBASE_URL is not defined in environment variables"
  );
}

export const createPocketBase = () => new PocketBase(pocketbaseUrl);

let clientPB: PocketBase | null = null;

export const getClientPB = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!clientPB) {
    clientPB = new PocketBase(pocketbaseUrl);

    try {
      const token = Cookies.get("pb_auth") || Cookies.get("pocketbase_auth");

      if (token) {
        clientPB.authStore.save(token);
        console.log("Auth token loaded from cookie");

        Cookies.set("pb_auth", token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: 7,
          path: "/",
        });

        Cookies.set("pocketbase_auth", token, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: 7,
          path: "/",
        });

        return clientPB;
      }

      const cookies = document.cookie.split("; ");
      const authCookie =
        cookies.find((row) => row.startsWith("pb_auth=")) ||
        cookies.find((row) => row.startsWith("pocketbase_auth="));

      if (authCookie) {
        const token = authCookie.split("=")[1];
        if (token) {
          clientPB.authStore.save(token);
          console.log("Auth token loaded from document.cookie");

          Cookies.set("pb_auth", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: 7,
            path: "/",
          });

          Cookies.set("pocketbase_auth", token, {
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: 7,
            path: "/",
          });
        }
      }
    } catch (e) {
      console.error("Error loading auth from cookie:", e);
    }
  }

  return clientPB;
};

export const pb =
  typeof window === "undefined"
    ? createPocketBase()
    : (getClientPB() as PocketBase);
