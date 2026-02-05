import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

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
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen bg-slate-50`}>
        {/* Added 'pt-16' (padding-top) to compensate for the fixed navbar height.
           This prevents the dashboard from hiding behind the logo.
        */}
        <div className="flex-grow pt-16">
            {children}
        </div>
        
        <Footer />
      </body>
    </html>
  );
}