import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Montoran";
    const description =
      searchParams.get("description") || "Find your perfect car";
    const imageUrl = searchParams.get("images");

    const defaultImageUrl =
      "https://ik.imagekit.io/tuxinity/montoran/default-car.png?updatedAt=1741649944918";

    let finalImageUrl = defaultImageUrl;
    if (imageUrl) {
      const lowerCaseUrl = imageUrl.toLowerCase();
      const isSupported =
        lowerCaseUrl.endsWith(".jpg") ||
        lowerCaseUrl.endsWith(".jpeg") ||
        lowerCaseUrl.endsWith(".png") ||
        lowerCaseUrl.endsWith(".webp") ||
        lowerCaseUrl.endsWith(".gif");

      if (isSupported) {
        finalImageUrl = imageUrl;
      } else {
        console.log(
          `Unsupported image format: ${imageUrl}, using default image`
        );
      }
    }

    const truncatedDescription =
      description.length > 100
        ? description.substring(0, 97) + "..."
        : description;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(to bottom, #0F172A, #1E293B)",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(to right, #3B82F6, #8B5CF6)",
                marginRight: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              M
            </div>
            <div
              style={{
                fontSize: "24px",
                color: "#94A3B8",
              }}
            >
              montoran.id
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              display: "flex",
              flexGrow: 1,
            }}
          >
            <div
              style={{
                width: "50%",
                paddingRight: "40px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <h1
                style={{
                  fontSize: "60px",
                  fontWeight: "bold",
                  color: "white",
                  margin: "0 0 24px 0",
                  lineHeight: "1.1",
                  textTransform: "capitalize",
                }}
              >
                {title}
              </h1>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "24px",
                    color: "#94A3B8",
                    margin: "0",
                    lineHeight: "1.4",
                  }}
                >
                  {truncatedDescription}
                </p>

                {/* Button */}
                <div
                  style={{
                    display: "flex",
                    padding: "8px 16px",
                    background: "rgba(59, 130, 246, 0.2)",
                    borderRadius: "8px",
                    color: "#60A5FA",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginTop: "8px",
                    width: "150px",
                    justifyContent: "center",
                  }}
                >
                  Lihat Detail
                </div>
              </div>
            </div>

            <div
              style={{
                width: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={finalImageUrl}
                alt={title}
                width={400}
                height={400}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "content-type": "image/png",
          "cache-control": "public, immutable, no-transform, max-age=31536000",
        },
      }
    );
  } catch (e: unknown) {
    console.error(`Error generating OG image: ${e}`);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
