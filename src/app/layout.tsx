import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MantineProvider } from '@mantine/core';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Box of Hope - Community Wishlist Platform",
  description: "Donate goods to fulfill specific needs in your local community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider>
          {children}
          <Toaster position="top-right" />
        </MantineProvider>
      </body>
    </html>
  );
}
