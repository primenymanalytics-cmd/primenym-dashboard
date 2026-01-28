"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

// Import your custom components
import AgencySeatManager from "@/components/AgencySeatManager";
import PricingCard from "@/components/PricingCard";

// --- CONFIGURATION: STRIPE PRICE IDs ---
// Go to Stripe Dashboard > Product Catalog > Click a product > Look for "API ID" (price_...)
const PRICE_SOLO = "price_1SuZb6CTIf97etr1MCiFxDq8";   // Replace with your 'Solo' Price ID
const PRICE_AGENCY = "price_1SuZcFCTIf97etr1cabloCAX"; // Replace with your 'Agency' Price ID

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- DUMMY DATA (We will replace this with Firestore data in Phase 4) ---
  const dummyQuotas = {
    WOOCOMMERCE: {
      limit: 4,
      used_items: ["https://shoe-shop.com", "https://hat-store.com"]
    },
    FACEBOOK: {
      limit: 2,
      used_items: ["act_55667788"]
    },
    LINKEDIN: {
      limit: 0, 
      used_items: []
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Loading Spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Navigation Bar --- */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-brand">PrimeNym</span>
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">{user?.email}</div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* 1. Header & API Key */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your connectors and billing.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900">Master API Key</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Use this single key for all your connectors.</p>
            </div>
            <div className="mt-4 rounded-md bg-gray-50 p-3 font-mono text-sm border border-gray-200 text-gray-600">
              {/* We will fetch the real key from Firestore later */}
              sk_live_{user?.uid.substring(0, 8)}... (Upgrade to reveal)
            </div>
          </div>
        </div>

        {/* 2. Agency Manager (Visualizes Usage) */}
        <AgencySeatManager quotas={dummyQuotas} />

        {/* 3. Purchase Plans Section (New!) */}
        <div>
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Available Plans
          </h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
            <PricingCard
              name="Solo License"
              price="15"
              priceId={PRICE_SOLO}
              userId={user?.uid}
              userEmail={user?.email}
              features={[
                "1 WooCommerce Store",
                "Unlimited Looker Reports",
                "Email Support",
                "Cancel Anytime"
              ]}
            />
            
            <PricingCard
              name="Agency License"
              price="50"
              priceId={PRICE_AGENCY}
              userId={user?.uid}
              userEmail={user?.email}
              isPopular={true}
              features={[
                "5 WooCommerce Stores",
                "Add Facebook (Coming Soon)",
                "Priority Support",
                "Client Management Dashboard",
                "Higher API Limits"
              ]}
            />
          </div>
        </div>

      </main>
    </div>
  );
}