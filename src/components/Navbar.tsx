"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LogOut, LayoutDashboard, Store } from "lucide-react";

interface NavbarProps {
  userName?: string | null;
  userEmail?: string | null;
  activePage: "dashboard" | "marketplace";
}

export default function Navbar({ userName, userEmail, activePage }: NavbarProps) {
  const displayName = userName || userEmail || "User";

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* --- BRANDING (Matches Marketing Site) --- */}
        <Link href="/dashboard" className="flex items-center">
          {/* Ensure full-logo.svg is in your 'public' folder */}
          <Image 
            src="/full-logo.svg" 
            alt="PrimeNym" 
            width={160} 
            height={32} 
            priority 
            className="object-contain"
          />
        </Link>

        {/* --- APP NAVIGATION (Center) --- */}
        <div className="hidden md:flex space-x-1 items-center bg-gray-50/50 p-1 rounded-lg border border-gray-100">
           <Link 
             href="/dashboard"
             className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activePage === "dashboard"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100"
                : "text-gray-500 hover:text-gray-900"
             }`}
           >
             <LayoutDashboard className="w-4 h-4 mr-2" />
             Dashboard
           </Link>

           <Link 
             href="/marketplace"
             className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activePage === "marketplace"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-100"
                : "text-gray-500 hover:text-gray-900"
             }`}
           >
             <Store className="w-4 h-4 mr-2" />
             Marketplace
           </Link>
        </div>

        {/* --- USER PROFILE (Right) --- */}
        <div className="flex items-center gap-4">
            {/* User Name Display */}
            <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-gray-700">
                  {displayName}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Pro Plan
                </span>
            </div>

            {/* Sign Out Button */}
            <button 
                onClick={() => signOut(auth)} 
                className="group flex items-center justify-center p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Sign Out"
            >
                <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </button>
        </div>

      </div>
    </nav>
  );
}