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
    password: string
  ): Promise<{ token: string; user: { id: string; email: string } }> => {
    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      Cookies.set("pb_auth", pb.authStore.token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
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
        (provider) => provider.name === "google"
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
    redirectUrl: string
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
  },
};

export default AuthApi;
