import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { ProgressBarProvider, QueryProvider } from "@/components/providers";
import { I18nProvider } from "./i18n-provider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Montoran - Temukan Mobil Bekas Impian Anda",
  description:
    "Jelajahi koleksi mobil bekas berkualitas kami. Setiap mobil dilengkapi dengan riwayat lengkap dan inspeksi menyeluruh.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="id">
      <body className={`min-h-screen flex flex-col ${inter.className}`}>
        <QueryProvider>
          <I18nProvider>
            <ProgressBarProvider />
            {children}
            <Toaster />
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
