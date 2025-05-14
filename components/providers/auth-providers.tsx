"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AuthApi from "@/lib/auth-api";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { pb } from "@/lib/pocketbase";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    AuthApi.logout();
    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("montoran_auth");
    }

    router.push("/login");
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        console.log("Checking authentication status...");

        const storedAuthData = localStorage.getItem("montoran_auth");
        if (storedAuthData) {
          try {
            const authData = JSON.parse(storedAuthData);
            if (
              authData.token &&
              authData.user &&
              authData.expires > Date.now()
            ) {
              console.log("Found valid auth data in localStorage");

              pb.authStore.save(authData.token, authData.user);

              Cookies.set("pb_auth", authData.token, {
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                expires: 7,
                path: "/",
              });

              Cookies.set("pocketbase_auth", authData.token, {
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                expires: 7,
                path: "/",
              });
            }
          } catch (e) {
            console.error("Error parsing stored auth data:", e);
            localStorage.removeItem("montoran_auth");
          }
        }

        if (pb.authStore.isValid) {
          console.log("PocketBase auth is valid");
          const currentUser = AuthApi.getCurrentUser();
          if (currentUser) {
            console.log(
              "User found in PocketBase auth store:",
              currentUser.name,
            );
            setUser({
              id: currentUser.id,
              email: currentUser.email,
              name: currentUser.name,
            });

            const authData = {
              token: pb.authStore.token,
              user: {
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.name,
                collectionId: "users",
                collectionName: "users",
              },
              expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            };
            localStorage.setItem("montoran_auth", JSON.stringify(authData));

            Cookies.set("pb_auth", pb.authStore.token, {
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              expires: 7,
              path: "/",
            });

            Cookies.set("pocketbase_auth", pb.authStore.token, {
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              expires: 7,
              path: "/",
            });

            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);

            document.cookie = `pb_auth=${
              pb.authStore.token
            }; expires=${expiryDate.toUTCString()}; path=/; ${
              process.env.NODE_ENV === "production" ? "secure;" : ""
            } samesite=strict`;
            document.cookie = `pocketbase_auth=${
              pb.authStore.token
            }; expires=${expiryDate.toUTCString()}; path=/; ${
              process.env.NODE_ENV === "production" ? "secure;" : ""
            } samesite=strict`;
          } else {
            console.log("PocketBase auth is valid but no user data found");

            const authCookie =
              Cookies.get("pb_auth") || Cookies.get("pocketbase_auth");
            if (authCookie) {
              console.log("Found auth cookie, trying to restore session");
              pb.authStore.save(authCookie);
              const restoredUser = AuthApi.getCurrentUser();
              if (restoredUser) {
                console.log(
                  "Successfully restored user from cookie:",
                  restoredUser.name,
                );
                setUser({
                  id: restoredUser.id,
                  email: restoredUser.email,
                  name: restoredUser.name,
                });

                const authData = {
                  token: authCookie,
                  user: {
                    id: restoredUser.id,
                    email: restoredUser.email,
                    name: restoredUser.name,
                    collectionId: "users",
                    collectionName: "users",
                  },
                  expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
                };
                localStorage.setItem("montoran_auth", JSON.stringify(authData));

                Cookies.set("pb_auth", authCookie, {
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "strict",
                  expires: 7,
                  path: "/",
                });

                Cookies.set("pocketbase_auth", authCookie, {
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "strict",
                  expires: 7,
                  path: "/",
                });

                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 7);

                document.cookie = `pb_auth=${authCookie}; expires=${expiryDate.toUTCString()}; path=/; ${
                  process.env.NODE_ENV === "production" ? "secure;" : ""
                } samesite=strict`;
                document.cookie = `pocketbase_auth=${authCookie}; expires=${expiryDate.toUTCString()}; path=/; ${
                  process.env.NODE_ENV === "production" ? "secure;" : ""
                } samesite=strict`;
              } else {
                console.log("Failed to restore user from cookie");
                pb.authStore.clear();
                localStorage.removeItem("montoran_auth");
                Cookies.remove("pb_auth", { path: "/" });
                Cookies.remove("pocketbase_auth", { path: "/" });
              }
            } else {
              console.log("No auth cookie found");
              pb.authStore.clear();
              localStorage.removeItem("montoran_auth");
            }
          }
        } else {
          console.log("PocketBase auth is not valid, checking cookies");
          const authCookie =
            Cookies.get("pb_auth") || Cookies.get("pocketbase_auth");
          if (authCookie) {
            console.log("Found auth cookie, trying to restore session");
            const restoredUser = AuthApi.getCurrentUser();
            if (restoredUser) {
              console.log(
                "Successfully restored user from cookie:",
                restoredUser.name,
              );
              setUser({
                id: restoredUser.id,
                email: restoredUser.email,
                name: restoredUser.name,
              });

              const authData = {
                token: authCookie,
                user: {
                  id: restoredUser.id,
                  email: restoredUser.email,
                  name: restoredUser.name,
                  collectionId: "users",
                  collectionName: "users",
                },
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
              };
              localStorage.setItem("montoran_auth", JSON.stringify(authData));

              Cookies.set("pb_auth", authCookie, {
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                expires: 7,
                path: "/",
              });

              Cookies.set("pocketbase_auth", authCookie, {
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                expires: 7,
                path: "/",
              });

              const expiryDate = new Date();
              expiryDate.setDate(expiryDate.getDate() + 7);

              document.cookie = `pb_auth=${authCookie}; expires=${expiryDate.toUTCString()}; path=/; ${
                process.env.NODE_ENV === "production" ? "secure;" : ""
              } samesite=strict`;
              document.cookie = `pocketbase_auth=${authCookie}; expires=${expiryDate.toUTCString()}; path=/; ${
                process.env.NODE_ENV === "production" ? "secure;" : ""
              } samesite=strict`;
            } else {
              console.log("Failed to restore user from cookie");
              pb.authStore.clear();
              localStorage.removeItem("montoran_auth");
              Cookies.remove("pb_auth", { path: "/" });
              Cookies.remove("pocketbase_auth", { path: "/" });
            }
          } else {
            console.log("No auth cookies found");
            localStorage.removeItem("montoran_auth");
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        pb.authStore.clear();
        localStorage.removeItem("montoran_auth");
        Cookies.remove("pb_auth", { path: "/" });
        Cookies.remove("pocketbase_auth", { path: "/" });
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = pb.authStore.onChange(() => {
      console.log("Auth state changed");
      const currentUser = AuthApi.getCurrentUser();
      if (currentUser) {
        console.log("User found in auth change:", currentUser.name);
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
        });

        const authData = {
          token: pb.authStore.token,
          user: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            collectionId: "users",
            collectionName: "users",
          },
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        };
        localStorage.setItem("montoran_auth", JSON.stringify(authData));

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
        }
      } else {
        console.log("No user found in auth change");
        setUser(null);
        localStorage.removeItem("montoran_auth");
      }
    });

    checkAuth();

    const intervalId = setInterval(checkAuth, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
