"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Facebook, 
  Linkedin, 
  X, 
  CheckCircle2, 
  Zap 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PricingCard from "@/components/PricingCard";

// Define the shape of a Connector
interface Connector {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  status: "active" | "coming_soon";
  features: string[];
}

export default function MarketplacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State to manage which connector's pricing modal is open
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);

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

  const connectors: Connector[] = [
    {
      id: "WOOCOMMERCE",
      name: "WooCommerce",
      description: "The complete e-commerce solution. Sync orders, customer data, and sales trends directly to Looker Studio.",
      icon: ShoppingCart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      status: "active",
      features: ["Real-time Order Sync", "Customer Lifetime Value", "Product Performance"]
    },
    {
      id: "FACEBOOK",
      name: "Facebook Ads",
      description: "Track ROAS, CPM, and campaign performance alongside your sales data.",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      status: "coming_soon",
      features: ["Ad Spend Analysis", "Campaign ROI", "Audience Demographics"]
    },
    {
      id: "LINKEDIN",
      name: "LinkedIn Ads",
      description: "B2B professional analytics for company pages and campaign managers.",
      icon: Linkedin,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      status: "coming_soon",
      features: ["Lead Gen Metrics", "Company Engagement", "Professional Demographics"]
    }
  ];

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
              Browse our catalog of high-performance connectors. Install what you need, when you need it.
            </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        
        {/* CONNECTOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectors.map((connector) => (
                <div 
                    key={connector.id}
                    className={`bg-white rounded-2xl p-6 border transition-all duration-300 ${
                        connector.status === "active" 
                        ? "border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200" 
                        : "border-slate-100 opacity-75"
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${connector.bgColor}`}>
                            <connector.icon className={`w-8 h-8 ${connector.color}`} />
                        </div>
                        {connector.status === "active" ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center">
                                <Zap className="w-3 h-3 mr-1" fill="currentColor" />
                                Available
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
                                Coming Soon
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{connector.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 h-12 line-clamp-2">
                        {connector.description}
                    </p>

                    {/* Features List */}
                    <ul className="space-y-2 mb-8">
                        {connector.features.map((feat, i) => (
                            <li key={i} className="flex items-center text-xs text-slate-600 font-medium">
                                <CheckCircle2 className="w-4 h-4 text-slate-300 mr-2" />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    {/* Action Button */}
                    <button
                        onClick={() => connector.status === "active" && setSelectedConnector(connector.id)}
                        disabled={connector.status !== "active"}
                        className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                            connector.status === "active"
                            ? "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                        {connector.status === "active" ? "View Pricing & Install" : "Notify Me"}
                    </button>
                </div>
            ))}
        </div>

      </main>

      {/* --- PRICING MODAL (Popup) --- */}
      {selectedConnector === "WOOCOMMERCE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark Overlay */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => setSelectedConnector(null)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedConnector(null)}
                    className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-slate-600" />
                </button>

                {/* Modal Header */}
                <div className="text-center pt-10 pb-6 px-6 bg-slate-50 border-b border-slate-100">
                    <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-4">
                        <ShoppingCart className="w-8 h-8 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">WooCommerce Plans</h2>
                    <p className="text-slate-500 mt-2">Choose a license that fits your agency needs.</p>
                </div>

                {/* Pricing Cards Container */}
                <div className="p-8 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    
                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">
                            Payments are securely processed by Stripe. You can cancel anytime from the dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}