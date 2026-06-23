import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { SpaceCanvas } from "@/components/scene/SpaceCanvas";
import { Header } from "@/components/ui/Header";
import { AddPlanetModal } from "@/components/ui/AddPlanetModal";
import { NebulaBackground } from "@/components/ui/NebulaBackground";
import { Analytics } from "@vercel/analytics/next";

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
        {/* Global Chunk Load Error Auto-Reload handler */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                var msg = e.message || '';
                if (
                  msg.indexOf('ChunkLoadError') !== -1 ||
                  msg.toLowerCase().indexOf('loading chunk') !== -1 ||
                  msg.toLowerCase().indexOf('failed to fetch') !== -1
                ) {
                  console.warn('Next.js chunk load error detected! Reloading page to fetch fresh assets...', e);
                  window.location.reload();
                }
              }, true);
            `,
          }}
        />
        <AudioProvider>
          {/* Nebula CSS background — hidden during intro, fades in after */}
          <NebulaBackground />

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
        <Analytics />
      </body>
    </html>
  );
}



