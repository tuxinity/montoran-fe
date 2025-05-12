"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CarList } from "@/components/car-list";
import { Car } from "@/types/car";
import { useState, useEffect } from "react";

interface HomeClientProps {
  initialCars: Car[];
}

export function HomeClient({ initialCars }: HomeClientProps) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Only update the mounted state on the client after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {/* Always use Indonesian for initial render to match server */}
              {!mounted
                ? "Temukan Mobil Bekas Impian Anda"
                : t("home.hero.title")}
            </h1>
            <p className="text-xl text-slate-200">
              {!mounted
                ? "Jelajahi koleksi mobil bekas berkualitas kami. Setiap mobil dilengkapi dengan riwayat lengkap dan inspeksi menyeluruh."
                : t("home.hero.subtitle")}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                <Link href="#cars">
                  {!mounted ? "Lihat Mobil" : t("home.hero.cta")}{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto py-16 px-4 md:px-6">
        <div className="space-y-10">
          <div className="space-y-2 text-center" id="cars">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {!mounted ? "Mobil Tersedia" : t("home.available.title")}
            </h2>
            <p className="text-slate-600">
              {!mounted
                ? "Pilih dari koleksi kendaraan berkualitas kami untuk perjalanan Anda"
                : t("home.available.subtitle")}
            </p>
          </div>
          <CarList initialCars={initialCars} className="pb-8" />
        </div>
      </main>

      {/* Trust Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">
                {!mounted ? "Kualitas Terjamin" : t("home.trust.quality.title")}
              </h3>
              <p className="text-slate-300">
                {!mounted
                  ? "Setiap mobil menjalani inspeksi menyeluruh"
                  : t("home.trust.quality.desc")}
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">
                {!mounted ? "Harga Terbaik" : t("home.trust.price.title")}
              </h3>
              <p className="text-slate-300">
                {!mounted
                  ? "Harga kompetitif untuk semua kendaraan"
                  : t("home.trust.price.desc")}
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">
                {!mounted ? "Pembiayaan Mudah" : t("home.trust.finance.title")}
              </h3>
              <p className="text-slate-300">
                {!mounted
                  ? "Pilihan pembayaran yang fleksibel"
                  : t("home.trust.finance.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
