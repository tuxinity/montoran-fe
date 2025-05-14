import Cookies from "js-cookie";
import { pb } from "./pocketbase";
import type { IAuthAPI } from "@/types/api";

const AuthApi: IAuthAPI = {
  isLoggedIn: (): boolean => {
    return pb.authStore.isValid;
  },

  getCurrentUser: () => {
    const user = pb.authStore.model;
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.username || "User",
    };
  },

  getPocketBase: () => {
    return pb;
  },

  onAuthStateChange: (callback) => {
    return pb.authStore.onChange(callback);
  },

  login: async (
    email: string,
    password: string,
  ): Promise<{ token: string; user: { id: string; email: string } }> => {
    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      const token = pb.authStore.token;

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

      if (typeof window !== "undefined") {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        document.cookie = `pb_auth=${token}; expires=${expiryDate.toUTCString()}; path=/; ${
          process.env.NODE_ENV === "production" ? "secure;" : ""
        } samesite=strict`;
        document.cookie = `pocketbase_auth=${token}; expires=${expiryDate.toUTCString()}; path=/; ${
          process.env.NODE_ENV === "production" ? "secure;" : ""
        } samesite=strict`;

        const userData = {
          id: authData.record.id,
          email: authData.record.email,
          name: authData.record.name || authData.record.username || "User",
          collectionId: "users",
          collectionName: "users",
        };

        const localAuthData = {
          token: token,
          user: userData,
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
        localStorage.setItem("montoran_auth", JSON.stringify(localAuthData));
      }

      return {
        token: authData.token,
        user: {
          id: authData.record.id,
          email: authData.record.email,
        },
      };
    } catch (error) {
      throw error;
    }
  },

  loginWithGoogle: async (): Promise<string> => {
    try {
      const redirectUrl = `${window.location.origin}/auth-callback`;
      const authMethods = await pb.collection("users").listAuthMethods();

      interface AuthProvider {
        name: string;
        authUrl: string;
        [key: string]: string | number | boolean | object;
      }

      interface AuthData {
        providers?: AuthProvider[];
      }

      const authData = authMethods as unknown as AuthData;
      const providers = authData.providers || [];

      const googleAuthProvider = providers.find(
        (provider) => provider.name === "google",
      );

      if (!googleAuthProvider) {
        throw new Error("Google authentication is not configured");
      }

      return (
        googleAuthProvider.authUrl +
        `&redirectUrl=${encodeURIComponent(redirectUrl)}`
      );
    } catch (error) {
      throw error;
    }
  },

  completeOAuthLogin: async (
    provider: string,
    code: string,
    state: string,
    redirectUrl: string,
  ) => {
    try {
      const authData = await pb
        .collection("users")
        .authWithOAuth2Code(provider, code, state, redirectUrl);

      Cookies.set("pb_auth", pb.authStore.token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return {
        token: authData.token,
        user: {
          id: authData.record.id,
          email: authData.record.email,
          name: authData.record.name || "",
        },
      };
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    pb.authStore.clear();

    Cookies.remove("pb_auth");
    Cookies.remove("pb_auth", { path: "/" });
    Cookies.remove("pocketbase_auth");
    Cookies.remove("pocketbase_auth", { path: "/" });

    if (typeof window !== "undefined") {
      const domain = window.location.hostname;

      document.cookie = `pb_auth=; Max-Age=0; path=/; domain=${domain}`;
      document.cookie = `pb_auth=; Max-Age=0; path=/;`;
      document.cookie = `pocketbase_auth=; Max-Age=0; path=/; domain=${domain}`;
      document.cookie = `pocketbase_auth=; Max-Age=0; path=/;`;

      if (domain === "localhost") {
        document.cookie = `pb_auth=; Max-Age=0; path=/;`;
        document.cookie = `pocketbase_auth=; Max-Age=0; path=/;`;
      }

      localStorage.removeItem("montoran_auth");

      console.log("Logged out and cleared all auth cookies and localStorage");
    }
  },
};

export default AuthApi;
