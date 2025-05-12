import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

/**
 * Handler for Google OAuth callback API route
 */
export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json();

    if (!code || !redirectUri) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const tokenData = await exchangeCodeForToken(code, redirectUri);
    if (!tokenData) {
      return NextResponse.json(
        { message: "Failed to exchange code for tokens" },
        { status: 500 }
      );
    }

    const userData = await fetchGoogleUserInfo(tokenData.access_token);
    if (!userData) {
      return NextResponse.json(
        { message: "Failed to fetch user info from Google" },
        { status: 500 }
      );
    }

    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;
    if (!pbUrl) {
      return NextResponse.json(
        { message: "PocketBase URL is not configured" },
        { status: 500 }
      );
    }

    const pb = new PocketBase(pbUrl);
    const existingUser = await findUserByEmail(pb, userData.email);

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User not registered",
          details:
            "This email is not registered in our system. Please contact administrator.",
        },
        { status: 404 }
      );
    }

    const authResult = await authenticateExistingUser(
      pb,
      existingUser,
      userData
    );
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token: authResult.token,
      user: {
        id: existingUser.id as string,
        email: userData.email,
        name: userData.name,
      },
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        message: "Server error",
        details: {
          message: err.message,
          name: err.name,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Exchange authorization code for access token from Google
 */
async function exchangeCodeForToken(code: string, redirectUri: string) {
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Get user information from Google API
 */
async function fetchGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch(GOOGLE_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Find user by email in PocketBase
 */
async function findUserByEmail(pb: PocketBase, email: string) {
  try {
    const result = await pb.collection("users").getList(1, 1, {
      filter: `email='${email}'`,
    });

    if (result.items.length > 0) {
      return result.items[0];
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Authenticate existing user
 */
async function authenticateExistingUser(
  pb: PocketBase,
  user: Record<string, unknown>,
  googleData: {
    email: string;
    name: string;
    picture?: string;
    id: string;
  }
) {
  try {
    if (!user.id || typeof user.id !== "string") {
      return {
        success: false,
        message: "Invalid user ID",
      };
    }

    const token = await createCustomToken(user.id as string, googleData.email);

    pb.authStore.save(token, {
      id: user.id as string,
      email: googleData.email,
      name: googleData.name,
      collectionId: "users",
      collectionName: "users",
      ...user,
    });

    return {
      success: true,
      token: pb.authStore.token,
    };
  } catch {
    return {
      success: false,
      message: "Failed to authenticate existing user",
    };
  }
}

/**
 * Create custom token for authentication
 * Note: This is a simple implementation, not secure for production
 */
async function createCustomToken(userId: string, email: string) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    id: userId,
    email: email,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    type: "auth",
  };

  const encodedHeader = Buffer.from(JSON.stringify(header))
    .toString("base64")
    .replace(/=+$/, "");

  const encodedPayload = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/=+$/, "");

  const signature = Buffer.from(`${encodedHeader}.${encodedPayload}`)
    .toString("base64")
    .replace(/=+$/, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
