"use client";

import { Search, Shield, Star, CheckCircle, Award, Tag } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function AboutClient() {
  const { t } = useTranslation();

  return (
    <main className="overflow-hidden">
      <div className="relative bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\' stroke=\'rgb(255 255 255 / 0.1)\'%3e%3cpath d=\'M0 .5H31.5V32\'/%3e%3c/svg%3e')] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-40 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-40"></div>

        <div className="relative container mx-auto px-4 py-28 md:py-36">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 text-primary text-sm font-medium border border-primary/20 shadow-sm">
              <Star className="w-4 h-4" fill="currentColor" />
              <span>{t("about.badge")}</span>
            </div>

            <h1 className="text-4xl py-2.5 md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-primary/70 drop-shadow-sm">
              {t("about.hero.title")}
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("about.hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/car"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Search className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                <span>{t("about.hero.cta")}</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-[60px] rotate-180 fill-slate-900"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
            ></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>

      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                500+
              </p>
              <p className="text-primary-foreground text-sm">{t("about.stats.cars")}</p>
            </div>
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                1250+
              </p>
              <p className="text-primary-foreground text-sm">{t("about.stats.customers")}</p>
            </div>
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                15+
              </p>
              <p className="text-primary-foreground text-sm">
                {t("about.stats.experience")}
              </p>
            </div>
            <div className="p-4">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                24/7
              </p>
              <p className="text-primary-foreground text-sm">
                {t("about.stats.support")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {t("about.why.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("about.why.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative p-8 rounded-xl bg-gradient-to-br from-muted/70 to-background border border-muted shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-5 -mr-5 bg-primary text-primary-foreground rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4 pt-2">
                {t("about.why.quality.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("about.why.quality.description")}
              </p>
              <div className="mt-6 pt-4 border-t border-muted">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>{t("about.why.quality.point1")}</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>{t("about.why.quality.point2")}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative p-8 rounded-xl bg-gradient-to-br from-muted/70 to-background border border-muted shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-5 -mr-5 bg-primary text-primary-foreground rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4 pt-2">
                {t("about.why.transaction.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("about.why.transaction.description")}
              </p>
              <div className="mt-6 pt-4 border-t border-muted">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>{t("about.why.transaction.point1")}</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>{t("about.why.transaction.point2")}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative p-8 rounded-xl bg-gradient-to-br from-muted/70 to-background border border-muted shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-5 -mr-5 bg-primary text-primary-foreground rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-4 pt-2">{t("about.why.price.title")}</h3>
              <p className="text-muted-foreground">
                {t("about.why.price.description")}
              </p>
              <div className="mt-6 pt-4 border-t border-muted">
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>{t("about.why.price.point1")}</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-primary mr-2" />
                    <span>{t("about.why.price.point2")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              {t("about.cta.title")}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              {t("about.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-white text-primary px-6 py-3 text-sm font-medium shadow hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t("about.cta.contact")}
              </Link>
              <Link
                href="/car"
                className="inline-flex items-center justify-center rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/20"
              >
                {t("about.cta.explore")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
