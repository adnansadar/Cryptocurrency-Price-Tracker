import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import "./styles.css";

export const metadata: Metadata = {
  title: {
    default: "Crypto Terminal — Market Research",
    template: "%s · Crypto Terminal",
  },
  description:
    "Screen, compare, and research cryptocurrency markets with transparent analytics.",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('cryptoTerminal.theme')==='light'?'light':'dark'}catch(e){}",
          }}
        />
        <Providers>
          <div className="app-shell">
            <Header />
            {children}
            <footer className="shell footer">
              <span>Market data by CoinGecko</span>
              <span>Crypto Terminal · © {new Date().getFullYear()}</span>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
