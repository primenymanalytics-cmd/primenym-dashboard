"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ShoppingCart, Facebook, Linkedin, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import PricingCard from "@/components/PricingCard";

export default function MarketplacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/login");
      else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar userEmail={user?.email} activePage="marketplace" />

      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Connector Marketplace</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Supercharge your Looker Studio reports. Connect to e-commerce, social, and professional networks in seconds.
            </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        
        {/* --- 1. WOOCOMMERCE SECTION (Active) --- */}
        <div className="mb-16">
            <div className="flex items-center gap-3 mb-6 ml-1">
                <div className="p-2 bg-purple-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">WooCommerce</h2>
                    <p className="text-slate-500 text-sm">Sync orders, products, and customer data.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <PricingCard
                    name="Solo License"
                    price="15"
                    priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO || ""} 
                    userId={user?.uid}
                    userEmail={user?.email}
                    features={["1 Store URL", "Unlimited Reports", "Real-time Sync", "Email Support"]}
                />
                
                <PricingCard
                    name="Agency License"
                    price="50"
                    priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY || ""}
                    userId={user?.uid}
                    userEmail={user?.email}
                    isPopular={true}
                    features={["5 Store URLs", "Priority Sync Speed", "Client Management", "Priority Support"]}
                />
            </div>
        </div>

        {/* --- 2. COMING SOON SECTION --- */}
        <div className="border-t border-slate-200 pt-10">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 ml-1">Coming Soon</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Facebook className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="px-2 py-1 bg-slate-100 text-xs font-semibold text-slate-500 rounded-full">In Development</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Facebook Ads</h4>
                    <p className="text-slate-500 text-sm mt-2">Pull campaign performance, ad spend, and conversion metrics directly into Looker Studio.</p>
                </div>

                {/* LinkedIn Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 opacity-75 hover:opacity-100 transition-opacity">
                     <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Linkedin className="w-6 h-6 text-blue-700" />
                        </div>
                        <span className="px-2 py-1 bg-slate-100 text-xs font-semibold text-slate-500 rounded-full">Planned</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">LinkedIn Ads</h4>
                    <p className="text-slate-500 text-sm mt-2">Professional B2B analytics for company pages and campaign manager accounts.</p>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}