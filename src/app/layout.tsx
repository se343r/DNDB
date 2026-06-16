import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { SpaceCanvas } from "@/components/scene/SpaceCanvas";
import { Header } from "@/components/ui/Header";
import { AddPlanetModal } from "@/components/ui/AddPlanetModal";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Danh nhân Bắc Đẩu | Bản đồ tri thức vũ trụ",
  description: "Web portfolio tương tác 3D lấy cảm hứng từ chòm sao Bắc Đẩu, tôn vinh cuộc đời và thành tựu vĩ đại của các danh nhân thế giới.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.className} h-full antialiased overflow-hidden select-none`}
    >
      <body className="h-full bg-black text-white relative flex flex-col">
        <AudioProvider>
          {/* Persistent WebGL Background */}
          <SpaceCanvas />

          {/* Global Navigation top bar */}
          <Header />

          {/* Interactive Page overlays */}
          <main className="relative z-10 w-full flex-1 overflow-hidden pointer-events-none">
            {children}
          </main>

          {/* Creator modal overlay */}
          <AddPlanetModal />
        </AudioProvider>
      </body>
    </html>
  );
}



