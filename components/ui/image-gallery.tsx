import Image from "next/image";
import { useEffect } from "react";

export const ImageGallery = ({
  images,
  selectedImage,
  onImageSelect,
  name,
}: {
  images: string[];
  selectedImage: number;
  onImageSelect: (index: number) => void;
  name: string;
}) => {
  useEffect(() => {
    images.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [images]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        <Image
          src={images[selectedImage] || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-opacity duration-300"
          priority={true}
          quality={90}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto p-2 scrollbar-hide">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onImageSelect(index)}
            className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted transition-all duration-200 ${
              selectedImage === index
                ? "ring-2 ring-primary scale-95"
                : "hover:scale-95"
            }`}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${name} view ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
              quality={60}
              priority={index < 4}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
