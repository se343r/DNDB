import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { SpaceCanvas } from "@/components/scene/SpaceCanvas";
import { Header } from "@/components/ui/Header";
import { AddPlanetModal } from "@/components/ui/AddPlanetModal";
import { NebulaBackground } from "@/components/ui/NebulaBackground";
import { Chatbot } from "@/components/ui/Chatbot";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
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
        {/* Global Chunk Load Error Auto-Reload handler & DevTools/Debugger Blocker */}
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

              (function() {
                var isLocal = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1' || 
                              window.location.hostname.indexOf('192.168.') === 0 || 
                              window.location.hostname.endsWith('.local');
                if (isLocal) return;

                // Disable right-click context menu
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                });

                // Disable keyboard shortcuts
                document.addEventListener('keydown', function(e) {
                  // F12 (123)
                  if (e.keyCode === 123) {
                    e.preventDefault();
                    return false;
                  }
                  // Ctrl+Shift+I (73), Ctrl+Shift+J (74), Ctrl+Shift+C (67)
                  if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
                    e.preventDefault();
                    return false;
                  }
                  // Ctrl+U (85) (View Source)
                  if (e.ctrlKey && e.keyCode === 85) {
                    e.preventDefault();
                    return false;
                  }
                  // Ctrl+S (83) (Save page)
                  if (e.ctrlKey && e.keyCode === 83) {
                    e.preventDefault();
                    return false;
                  }
                  // Ctrl+P (80) (Print page)
                  if (e.ctrlKey && e.keyCode === 80) {
                    e.preventDefault();
                    return false;
                  }
                });

                // Infinite debugger loop to halt execution if DevTools is opened
                setInterval(function() {
                  (function() {
                    return function(type) {
                      if ((type + "").indexOf("function") !== -1) {
                        debugger;
                      }
                    };
                  })()("bugger");
                }, 100);
              })();
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

          {/* Assistant chatbot overlay */}
          <Chatbot />
        </AudioProvider>
        <Analytics />
      </body>
    </html>
  );
}
