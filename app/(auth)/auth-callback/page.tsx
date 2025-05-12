"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import AuthApi from "@/lib/auth-api";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Authenticating...");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setError("Authentication timed out. Please try again.");
        setIsLoading(false);
      }
    }, 30000);

    const loadingTexts = [
      "Authenticating...",
      "Verifying credentials...",
      "Almost there...",
      "Checking account...",
    ];
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentIndex]);
    }, 2000);

    const handleAuth = async () => {
      try {
        const code = searchParams?.get("code");

        if (!code) {
          setError("Authentication failed. No authorization code received.");
          setIsLoading(false);
          return;
        }

        setLoadingText("Verifying with Google...");

        const response = await fetch("/api/auth/google-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            redirectUri: `${window.location.origin}/auth-callback`,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (
            response.status === 404 &&
            data.message === "User not registered"
          ) {
            setError("Account not registered");
            setErrorDetails(
              data.details ||
                "This email is not registered in our system. Please contact administrator."
            );
          } else {
            setError("Authentication failed");
            setErrorDetails(
              data.message || "An error occurred during authentication."
            );
          }
          setIsLoading(false);
          return;
        }

        Cookies.set("pb_auth", data.token, { expires: 7 });

        const pb = AuthApi.getPocketBase();
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || data.user.email.split("@")[0],
          collectionId: "users",
          collectionName: "users",
        };

        pb.authStore.save(data.token, userData);
        router.push("/dashboard");
      } catch {
        setError("Authentication failed");
        setErrorDetails("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    };

    handleAuth();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(textInterval);
    };
  }, [router, searchParams, isLoading]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Authentication</h1>
          {error ? (
            <>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-lg font-medium text-red-800">{error}</h3>
                {errorDetails && (
                  <p className="mt-2 text-sm text-red-700">{errorDetails}</p>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-gray-600">{loadingText}</p>
              <div className="mt-6 flex justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
              <div className="mt-6 flex justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
