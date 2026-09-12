import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppQueryClientProvider } from "@/lib/query-client";
import { AuthProvider } from "@/lib/auth/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinanceOS",
  description: "Fərdi maliyyə platforması",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="az"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50">
        <AppQueryClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </AppQueryClientProvider>
      </body>
    </html>
  );
}
