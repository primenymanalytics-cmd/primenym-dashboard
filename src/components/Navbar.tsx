"use client";

import Link from "next/link";
import { LayoutDashboard, Store, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface NavbarProps {
  userEmail?: string | null;
  activePage: "dashboard" | "marketplace";
}

export default function Navbar({ userEmail, activePage }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">PrimeNym</span>
            </Link>

            <div className="hidden md:flex gap-1">
              <Link 
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === "dashboard" 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/marketplace"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === "marketplace" 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                Marketplace
              </Link>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-medium text-slate-700">
              {userEmail}
            </span>
            <button 
              onClick={() => signOut(auth)} 
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}