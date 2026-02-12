"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ShieldCheck, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";

// Helper to generate a random auth code
const generateAuthCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

function AuthorizeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // OAuth Params from Looker Studio
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // If not logged in, redirect to login with a return URL
        const returnUrl = encodeURIComponent(`/auth/looker/authorize?redirect_uri=${redirectUri}&state=${state}`);
        router.push(`/login?redirect=${returnUrl}`);
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [redirectUri, state, router]);

  const handleAuthorize = async () => {
    if (!user || !redirectUri) return;
    setProcessing(true);
    setError("");

    try {
      // 1. Generate a Temporary Auth Code
      const authCode = generateAuthCode();

      // 2. Save Code to Firestore (valid for 10 minutes)
      // We will verify this code in Step 2 (The Token Endpoint)
      await addDoc(collection(db, "auth_codes"), {
        code: authCode,
        uid: user.uid,
        email: user.email,
        created_at: serverTimestamp(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 mins from now
        used: false
      });

      // 3. Redirect back to Looker Studio
      // This closes the popup and passes the code to Google
      const callbackUrl = `${redirectUri}?code=${authCode}&state=${state}`;
      window.location.href = callbackUrl;

    } catch (err: any) {
      console.error(err);
      setError("System error. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 text-sm">Verifying identity...</p>
      </div>
    );
  }

  if (!redirectUri) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-red-600">
           <AlertCircle className="w-10 h-10 mb-2" />
           <p>Invalid Request: Missing redirect_uri</p>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Logo Area */}
        <div className="flex justify-center mb-6">
           <Image 
               src="/full-logo.svg" 
               alt="PrimeNym" 
               width={180} 
               height={40} 
               className="object-contain"
           />
        </div>

        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-slate-200 text-center">
          
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>

          <h3 className="text-lg leading-6 font-medium text-slate-900 mb-2">
            Connect to Looker Studio
          </h3>
          
          <p className="text-sm text-slate-500 mb-6">
            Looker Studio wants to access your <strong>PrimeNym</strong> account to retrieve connector data.
          </p>

          {/* User Info Card */}
          <div className="bg-slate-50 rounded-lg p-3 mb-6 flex items-center gap-3 border border-slate-100 text-left">
             <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {user.email?.substring(0,2).toUpperCase()}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{user.displayName || "User"}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
             </div>
             <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-2 rounded text-sm">
                {error}
            </div>
          )}

          <div className="space-y-3">
            <button
                onClick={handleAuthorize}
                disabled={processing}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
                {processing ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Authorizing...
                    </span>
                ) : (
                    "Authorize Access"
                )}
            </button>

            <button
                onClick={() => router.push("/")}
                disabled={processing}
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-all"
            >
                Cancel
            </button>
          </div>
          
          <p className="mt-6 text-xs text-slate-400">
            This will allow Looker Studio to view your configured connectors and report data.
          </p>

        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense for Next.js boundary requirements
export default function AuthorizePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AuthorizeContent />
    </Suspense>
  );
}