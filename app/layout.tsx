import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { createClient } from '@/lib/supabase/server';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/auth-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Noka",
  description: "Personal Finance Tracker",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side session verification for SSR optimization
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Note: Server-side user info is for SSR optimization only
  // Client-side AuthProvider manages the reactive auth state

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
