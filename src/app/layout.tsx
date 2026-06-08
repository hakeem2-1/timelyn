import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppProvider";
import { HydrationGate } from "@/components/layout/HydrationGate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Timelyn — Daily Task Sheets",
  description:
    "Daily employee task-sheet system for assigning, tracking, and reporting work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark`}
    >
      <body className="min-h-full antialiased">
        <AppProvider>
          <HydrationGate>{children}</HydrationGate>
        </AppProvider>
      </body>
    </html>
  );
}
