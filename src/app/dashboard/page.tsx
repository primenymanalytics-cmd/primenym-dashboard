"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import AgencySeatManager from "@/components/AgencySeatManager";
import PricingCard from "@/components/PricingCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [licenseData, setLicenseData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        await fetchOrCreateUser(currentUser.uid, currentUser.email);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchOrCreateUser = async (uid: string, email: string | null) => {
    try {
      const docRef = doc(db, "licenses", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLicenseData(docSnap.data());
      } else {
        const freeTierData = {
          owner_id: uid,
          customer_email: email,
          master_key: "PENDING_PURCHASE",
          active: true,
          quotas: {
            WOOCOMMERCE: { limit: 0, used_items: [] },
            FACEBOOK: { limit: 0, used_items: [] }
          }
        };
        await setDoc(docRef, freeTierData);
        setLicenseData(freeTierData);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          <p className="mt-4 text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your API keys and connector licenses here.
          </p>
        </div>

        {/* API Key Section */}
        <div className="bg-white shadow rounded-lg border border-gray-200 mb-8 p-6">
            <h3 className="text-lg font-medium text-gray-900">Master API Key</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
               <p>Use this single key for all your connectors.</p>
            </div>
            <div className="mt-4 rounded-md bg-gray-50 p-3 font-mono text-sm border border-gray-200 text-gray-600 break-all">
                  {licenseData?.master_key || "Generating Key..."}
            </div>
            {licenseData?.master_key === "PENDING_PURCHASE" && (
                <p className="mt-2 text-xs text-amber-600 font-medium">
                    * Your key is inactive. Purchase a plan below to unlock it.
                </p>
            )}
        </div>

        {/* Quota Manager - Pass KEY and QUOTAS */}
        {licenseData && licenseData.quotas ? (
            <AgencySeatManager 
                quotas={licenseData.quotas} 
                licenseKey={licenseData.master_key} // <--- PASSED HERE
            />
        ) : (
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
              No subscription data found. Please select a plan below.
            </div>
        )}

        {/* Purchase Section */}
        <div className="mt-12">
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Available Plans
          </h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-8">
            <PricingCard
              name="Solo License"
              price="15"
              priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO || ""} 
              userId={user?.uid}
              userEmail={user?.email}
              features={[
                "1 WooCommerce Store",
                "Unlimited Reports",
                "Email Support"
              ]}
            />
            
            <PricingCard
              name="Agency License"
              price="50"
              priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY || ""}
              userId={user?.uid}
              userEmail={user?.email}
              isPopular={true}
              features={[
                "5 WooCommerce Stores",
                "Add Facebook (Coming Soon)",
                "Priority Support",
                "Client Management"
              ]}
            />
          </div>
        </div>

      </main>
    </div>
  );
}