import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppToastProvider } from "@/app/components/app-toast-provider";
import "./globals.css";
import Footer from "./components/layout/footer";
import AppNavbar from "./components/layout/app-navbar";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IDS Record Tool Admin",
  description:
    "Administrative console for monitored IP ranges, traffic reports, and blacklist policies.",
};

export default function RootLayout({ children,}: Readonly<{  children: React.ReactNode;}>) {

  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-slate-50">
        <AppToastProvider>
          <AppNavbar />
          <div className="flex flex-1 flex-col">
            {children}
          </div>
          <Footer />
        </AppToastProvider>
      </body>
    </html>
  );
}
