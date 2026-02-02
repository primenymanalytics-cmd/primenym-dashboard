"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Key, Copy, Check, ShieldCheck, PlusCircle } from "lucide-react";
import Link from "next/link";
import AgencySeatManager from "@/components/AgencySeatManager";
import Navbar from "@/components/Navbar";

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
        // Pass the display name and email to the creator function
        await fetchOrCreateUser(currentUser.uid, currentUser.email, currentUser.displayName);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // UPDATED: Now accepts displayName
  const fetchOrCreateUser = async (uid: string, email: string | null, displayName: string | null) => {
    try {
      const docRef = doc(db, "licenses", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setLicenseData(docSnap.data());
      } else {
        // User is NEW! Create a "Free Tier" record automatically.
        const freeTierData = {
          owner_id: uid,
          display_name: displayName || "User", // <--- Save Name from Google Auth
          customer_email: email,
          master_key: "PENDING_PURCHASE",
          active: true,
          created_at: new Date(),
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
      {/* Pass userName to Navbar */}
      <Navbar 
        userName={user?.displayName} 
        userEmail={user?.email} 
        activePage="dashboard" 
      />

      {/* --- Header Hero Section --- */}
      <div className="bg-slate-900 text-white pb-32 pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="mt-2 text-slate-400">Manage your licenses and track usage.</p>
                </div>
                
                <Link 
                    href="/marketplace" 
                    className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <PlusCircle className="w-5 h-5" />
                    Add Connector
                </Link>
            </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-12">
        
        {/* --- API Key Card --- */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                    <Key className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Master API Key</h3>
                    <p className="text-slate-500 text-sm">One key for all your connectors.</p>
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

        {/* --- Main Content --- */}
        <div className="space-y-10">
            {licenseData && licenseData.quotas ? (
                <section>
                    <AgencySeatManager 
                        quotas={licenseData.quotas} 
                        licenseKey={licenseData.master_key} 
                    />
                </section>
            ) : (
                <div className="text-center py-12">
                   <p className="text-slate-500">Loading your data...</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}