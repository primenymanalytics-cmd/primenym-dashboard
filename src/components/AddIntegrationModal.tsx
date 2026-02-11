"use client";

import { useState } from "react";
import { X, Loader2, ShoppingBag } from "lucide-react";

interface AddIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string | null;
  onSuccess: () => void; // To refresh the list after adding
}

export default function AddIntegrationModal({ isOpen, onClose, userId, userEmail, onSuccess }: AddIntegrationModalProps) {
  const [shopUrl, setShopUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/integrations/shopify/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopUrl,
          accessToken,
          userId,
          userEmail
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to connect store.");
      }

      // Success!
      onSuccess();
      onClose();
      setShopUrl("");
      setAccessToken("");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            Connect Shopify Store
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Store URL</label>
            <input 
              type="text" 
              placeholder="my-brand.myshopify.com"
              value={shopUrl}
              onChange={(e) => setShopUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              required
            />
            <p className="text-xs text-slate-400 mt-1">Do not include https://</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin API Access Token</label>
            <input 
              type="password" 
              placeholder="shpat_xxxxxxxxxxxxxxxx"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Found in Shopify Admin &gt; Settings &gt; Apps &gt; Develop apps.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                "Connect Store"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}