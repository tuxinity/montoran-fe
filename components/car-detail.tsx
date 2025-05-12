"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Car } from "@/types/car";
import { ImageGallery } from "./ui/image-gallery";
import { idrFormat } from "@/utils/idr-format";
import { Calendar, Users, Briefcase, Gauge, ArrowUp } from "lucide-react";
import CarApi from "@/lib/car-api";
import { useTranslation } from "react-i18next";

interface CarDetailProps {
  data: Car;
}

export function CarDetail({ data }: CarDetailProps) {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [selectedImage, setSelectedImage] = useState(0);

  const specs = [
    {
      icon: <Calendar className="w-6 h-6" aria-hidden="true" />,
      label: isMounted ? t("carDetail.specs.year") : "Tahun",
      value: data.year,
    },
    {
      icon: <Users className="w-6 h-6" aria-hidden="true" />,
      label: isMounted ? t("carDetail.specs.capacity") : "Kapasitas",
      value: data.expand?.model?.seats || "N/A",
    },
    {
      icon: <Briefcase className="w-6 h-6" aria-hidden="true" />,
      label: isMounted ? t("carDetail.specs.luggage") : "Bagasi",
      value: data.expand?.model?.bags ? `${data.expand.model.bags}` : "N/A",
    },
    {
      icon: <Gauge className="w-6 h-6" aria-hidden="true" />,
      label: isMounted ? t("carDetail.specs.transmission") : "Transmisi",
      value: data.transmission,
    },
  ];

  const handleWhatsAppClick = () => {
    let message;
    if (isMounted) {
      message = encodeURIComponent(
        t("carDetail.whatsappMessage", {
          model: data.expand?.model.name,
          year: data.year,
        })
      );
    } else {
      message = encodeURIComponent(
        `Halo, saya tertarik dengan ${data.expand?.model.name} tahun ${data.year}`
      );
    }
    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const images = data.images.map((image) => CarApi.getImageUrl(data, image));
  const modelName = data.expand?.model.name;
  const brandName = data.expand?.model.expand?.brand.name;
  const bodyTypeName = data.expand?.model?.expand?.body_type?.name;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="lg:sticky lg:top-6 space-y-4 max-h-[calc(100vh-3rem)] overflow-y-auto">
          <Link href="/" prefetch={false} className="inline-block">
            <Button variant="ghost" className="group">
              <ArrowUp
                className="w-4 h-4 mr-2 rotate-[270deg] transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
              {isMounted ? t("carDetail.backToListings") : "Back to Listings"}
            </Button>
          </Link>

          {data.is_sold && (
            <div className="bg-red-500 text-white text-center py-2 rounded-md mb-4">
              <span className="font-bold">
                {isMounted ? t("carDetail.soldOut") : "THIS CAR HAS BEEN SOLD"}
              </span>
            </div>
          )}

          <ImageGallery
            images={images}
            selectedImage={selectedImage}
            onImageSelect={setSelectedImage}
            name={modelName ?? "vehicle"}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold capitalize">{modelName}</h1>
            <div className="flex items-center gap-2 mt-1">
              {brandName && (
                <span className="text-muted-foreground uppercase">
                  {brandName}
                </span>
              )}
              {brandName && bodyTypeName && (
                <span className="text-muted-foreground">•</span>
              )}
              {bodyTypeName && (
                <span className="text-muted-foreground uppercase">
                  {bodyTypeName}
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-2">
              {isMounted ? t("carDetail.startingPrice") : "Harga Mulai dari"}{" "}
              {idrFormat(data.sell_price)}
            </p>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specs.map((spec, index) => (
              <div
                key={index}
                className="bg-muted/50 rounded-lg p-4 text-center space-y-2"
              >
                <div className="mx-auto w-8 h-8 text-muted-foreground">
                  {spec.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{spec.label}</p>
                  <p className="font-medium">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              {isMounted ? t("carDetail.aboutThisCar") : "About This Car"}
            </h2>
            <div
              className="prose prose-sm max-w-none text-muted-foreground [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-4 [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-2"
              dangerouslySetInnerHTML={{
                __html:
                  data.description ||
                  (isMounted
                    ? t("carDetail.noDescription")
                    : "No description available."),
              }}
            />
          </section>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isMounted ? t("carDetail.estDelivery") : "Est. Delivery"}
                </p>
                <p className="font-medium">March 2025</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {isMounted ? t("carDetail.totalPrice") : "Total Price"}
                </p>
                <p className="text-2xl font-bold">
                  {idrFormat(data.sell_price)}
                </p>
              </div>
            </div>
            <Button
              className="w-full group"
              size="lg"
              onClick={handleWhatsAppClick}
              disabled={data.is_sold}
            >
              {isMounted ? t("carDetail.whatsapp") : "WhatsApp"}
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 ml-2 fill-current transition-transform group-hover:scale-110"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
