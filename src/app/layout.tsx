import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- THIS LINE IS LIKELY MISSING OR BROKEN

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrimeNym Dashboard",
  description: "Manage your connector licenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}