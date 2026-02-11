"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Key, Copy, Check, ShieldCheck, PlusCircle, ShoppingBag, Plus } from "lucide-react";
import Link from "next/link";
import AgencySeatManager from "@/components/AgencySeatManager";
import Navbar from "@/components/Navbar";
import AddIntegrationModal from "@/components/AddIntegrationModal"; // Import the new Modal

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [licenseData, setLicenseData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  // State for the Add Integration Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for the list of connected stores
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        // 1. Fetch/Create User License
        await fetchOrCreateUser(currentUser.uid, currentUser.email, currentUser.displayName);
        // 2. Fetch Connected Stores
        await fetchIntegrations(currentUser.uid);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

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
          display_name: displayName || "User",
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

  // NEW: Fetch the list of connected stores from Firestore
  const fetchIntegrations = async (uid: string) => {
    try {
      const q = query(collection(db, "integrations"), where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      const stores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIntegrations(stores);
    } catch (err) {
      console.error("Error fetching integrations:", err);
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
                    <p className="mt-2 text-slate-400">Manage your licenses and connected stores.</p>
                </div>
                
                <Link 
                    href="/marketplace" 
                    className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <PlusCircle className="w-5 h-5" />
                    Browse Connectors
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
                    <p className="text-slate-500 text-sm">One key for all your legacy connectors.</p>
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

        {/* --- NEW SECTION: Connected Stores (OAuth) --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-slate-500" />
                    <h3 className="text-lg font-semibold text-slate-900">Connected Stores</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Connect Store
                </button>
            </div>
            
            <div className="p-6">
               {integrations.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {integrations.map((store) => (
                      <div key={store.id} className="border border-slate-200 rounded-xl p-4 flex items-center gap-3 hover:border-green-200 transition-colors bg-white">
                         <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                            {store.type === 'SHOPIFY' ? 'S' : 'W'}
                         </div>
                         <div className="overflow-hidden">
                            <h4 className="font-medium text-slate-900 truncate text-sm" title={store.shop_url}>
                              {store.shop_url}
                            </h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 mt-1">
                               ● Active
                            </span>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    <div className="mx-auto h-12 w-12 text-slate-300 mb-3">
                       <ShoppingBag className="h-full w-full" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">No stores connected yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Connect your Shopify store to see data in Looker Studio.</p>
                 </div>
               )}
            </div>
        </div>

        {/* --- Legacy Quota Manager --- */}
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
                   <p className="text-slate-500">Loading quota details...</p>
                </div>
            )}
        </div>
      </main>

      {/* --- The Add Integration Modal --- */}
      <AddIntegrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        userId={user?.uid}
        userEmail={user?.email}
        onSuccess={() => fetchIntegrations(user.uid)} // Refresh list after adding
      />
    </div>
  );
}