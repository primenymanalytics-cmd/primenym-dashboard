"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
    Key, 
    LogOut, 
    ShieldCheck, 
    CreditCard, 
    LayoutDashboard,
    Copy,
    Check
} from "lucide-react";
import AgencySeatManager from "@/components/AgencySeatManager";
import PricingCard from "@/components/PricingCard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [licenseData, setLicenseData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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
      console.error(err);
      setLoading(false);
    }
  };

  const copyKey = () => {
    if (licenseData?.master_key) {
        navigator.clipboard.writeText(licenseData.master_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* --- Top Navigation --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">PrimeNym</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-700">{user?.email}</span>
                <span className="text-xs text-slate-500">
                    {licenseData?.active ? "Pro Plan Active" : "Free Tier"}
                </span>
              </div>
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

      {/* --- Header Hero Section --- */}
      <div className="bg-slate-900 text-white pb-32 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="mt-2 text-slate-400">Manage your licenses, track usage, and upgrade your analytics power.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
        
        {/* --- API Key Card (Floating) --- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                    <Key className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Master API Key</h3>
                    <p className="text-slate-500 text-sm">One key for all your connectors. Keep it secret.</p>
                </div>
            </div>

            <div className="flex-1 max-w-lg">
                 <div className="relative flex items-center">
                    <code className="w-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-mono px-4 py-3 rounded-lg truncate">
                        {licenseData?.master_key || "Loading..."}
                    </code>
                    <button 
                        onClick={copyKey}
                        className="absolute right-2 p-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-slate-500 transition-all shadow-sm"
                        title="Copy Key"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                 </div>
                 {licenseData?.master_key === "PENDING_PURCHASE" && (
                    <p className="mt-2 text-xs text-amber-600 font-medium flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Purchase a plan to activate this key.
                    </p>
                 )}
            </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="space-y-10">
            
            {/* 1. Agency Manager */}
            {licenseData && licenseData.quotas ? (
                <section>
                    <AgencySeatManager 
                        quotas={licenseData.quotas} 
                        licenseKey={licenseData.master_key} 
                    />
                </section>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-center">
                    Please purchase a plan to view your connectors.
                </div>
            )}

            {/* 2. Pricing Section */}
            <section className="pt-10 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="w-6 h-6 text-slate-400" />
                    <h2 className="text-xl font-semibold text-slate-900">Available Plans</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <PricingCard
                        name="Solo License"
                        price="15"
                        priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO || ""} 
                        userId={user?.uid}
                        userEmail={user?.email}
                        features={["1 WooCommerce Store", "Unlimited Reports", "Email Support"]}
                    />
                    
                    <PricingCard
                        name="Agency License"
                        price="50"
                        priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY || ""}
                        userId={user?.uid}
                        userEmail={user?.email}
                        isPopular={true}
                        features={["5 WooCommerce Stores", "Priority Support", "Client Management"]}
                    />
                </div>
            </section>

        </div>
      </main>
    </div>
  );
}