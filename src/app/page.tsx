"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; // Import db
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { useRouter } from "next/navigation";
import AgencySeatManager from "@/components/AgencySeatManager";
import PricingCard from "@/components/PricingCard";

// Replace with your REAL Stripe Price IDs
const PRICE_SOLO = "price_1Q..."; 
const PRICE_AGENCY = "price_1Q...";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for REAL data
  const [licenseData, setLicenseData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        // FETCH OR CREATE USER DATA
        await fetchOrCreateUser(currentUser.uid, currentUser.email);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // --- THE NEW LOGIC: Fetch or Create ---
  const fetchOrCreateUser = async (uid: string, email: string | null) => {
    try {
      const docRef = doc(db, "licenses", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // User exists! Load their data.
        setLicenseData(docSnap.data());
      } else {
        // User is NEW! Create a "Free Tier" record automatically.
        const freeTierData = {
          owner_id: uid,
          customer_email: email,
          master_key: "PENDING_PURCHASE", // Placeholder until they buy
          active: true,
          quotas: {
            WOOCOMMERCE: { limit: 0, used_items: [] }, // 0 limits = Free
            FACEBOOK: { limit: 0, used_items: [] }
          }
        };
        
        await setDoc(docRef, freeTierData);
        setLicenseData(freeTierData); // Load this new data
        console.log("Created new Free Tier user.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-brand">PrimeNym</span>
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">{user?.email}</div>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your licenses.</p>
        </div>

        {/* API Key Section - SHOW REAL KEY */}
        <div className="bg-white shadow rounded-lg border border-gray-200 mb-8 p-6">
            <h3 className="text-lg font-medium text-gray-900">Master API Key</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
               <p>Use this single key for all your connectors.</p>
            </div>
            <div className="mt-4 rounded-md bg-gray-50 p-3 font-mono text-sm border border-gray-200 text-gray-600 break-all">
                  {licenseData?.master_key || "Loading..."}
            </div>
            {licenseData?.master_key === "PENDING_PURCHASE" && (
                <p className="mt-2 text-xs text-amber-600">
                    * Purchase a plan below to activate your key.
                </p>
            )}
        </div>

        {/* Quota Manager - PASS REAL DATA */}
        {licenseData && licenseData.quotas && (
            <AgencySeatManager quotas={licenseData.quotas} />
        )}

        {/* Purchase Section */}
        <div className="mt-12">
          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-6">Available Plans</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-8">
            <PricingCard
              name="Solo License"
              price="15"
              priceId={PRICE_SOLO}
              userId={user?.uid}
              userEmail={user?.email}
              features={["1 WooCommerce Store", "Unlimited Reports"]}
            />
            <PricingCard
              name="Agency License"
              price="50"
              priceId={PRICE_AGENCY}
              userId={user?.uid}
              userEmail={user?.email}
              isPopular={true}
              features={["5 WooCommerce Stores", "Priority Support"]}
            />
          </div>
        </div>

      </main>
    </div>
  );
}