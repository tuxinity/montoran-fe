export function getOgImageUrl({
  title,
  description,
  image,
}: {
  title?: string;
  description?: string;
  image?: string;
}): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://montoran.inklusif.id";
  const params = new URLSearchParams();

  let cleanDescription = description
    ? description.replace(/<[^>]*>?/gm, "")
    : "";
  if (cleanDescription && cleanDescription.length > 150) {
    cleanDescription = cleanDescription.substring(0, 147) + "...";
  }

  if (title) params.set("title", title);
  if (cleanDescription) params.set("description", cleanDescription);

  if (image) {
    params.set("images", image);
  } else {
    console.log("No image provided");
  }

  const url = `${baseUrl}/api/og?${params.toString()}`;
  console.log("Final OG URL:", url);
  return url;
}
