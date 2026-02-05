"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/dashboard" className="flex items-center mb-4">
                {/* Reusing the logo for consistency */}
                <Image 
                    src="/full-logo.svg" 
                    alt="PrimeNym" 
                    width={140} 
                    height={28} 
                    className="object-contain opacity-90"
                />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Supercharging Looker Studio with real-time connector data.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/marketplace" className="text-gray-500 hover:text-blue-600 text-sm">Marketplace</Link></li>
              <li><Link href="/dashboard" className="text-gray-500 hover:text-blue-600 text-sm">My Licenses</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm">API Status</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Privacy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm">Terms</a></li>
            </ul>
          </div>

        </div>
        
        <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} PrimeNym Analytics. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
             <span className="text-xs font-medium text-gray-600">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}