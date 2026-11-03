import type { Metadata } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Footer, Header, Toast } from "@/components/Header";

export const metadata: Metadata = {
  title: "IKAMAT Connect · Jejaring & Talent Pool Matematika Unpad",
  description:
    "Prototipe platform penghubung mahasiswa, dosen, dan alumni Matematika FMIPA Unpad: direktori civitas, lowongan tertarget, kemitraan riset, dan katalog talenta untuk HRD.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <StoreProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
