import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { createClient } from '@/lib/supabase-server';
import { ReactNode } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mora",
  description: "Daily Planner App. Simplified.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Example: Session verification in a server component
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // You can pass user info to children or context here if needed
  // Do not redirect in layout; handle in page components
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
