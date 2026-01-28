"use client";

import { useState } from "react";

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  priceId: string;
  userId: string;
  userEmail: string;
  isPopular?: boolean;
}

export default function PricingCard({ 
  name, price, features, priceId, userId, userEmail, isPopular 
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId, userEmail }),
      });

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert("Payment error: " + data.error);
      }
    } catch (err) {
      alert("Failed to connect to checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative p-8 bg-white border rounded-2xl shadow-sm flex flex-col ${isPopular ? 'border-brand ring-2 ring-brand ring-opacity-50' : 'border-gray-200'}`}>
      {isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand text-white text-xs font-bold uppercase tracking-wide rounded-full">
          Most Popular
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        <p className="mt-4 flex items-baseline text-gray-900">
          <span className="text-5xl font-extrabold tracking-tight">${price}</span>
          <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>
        </p>
        <ul role="list" className="mt-6 space-y-6">
          {features.map((feature) => (
            <li key={feature} className="flex">
              <svg className="flex-shrink-0 w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="ml-3 text-gray-500">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
          isPopular 
            ? 'bg-brand text-white hover:bg-brand-dark' 
            : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
        } transition-colors`}
      >
        {loading ? "Redirecting..." : "Get Access"}
      </button>
    </div>
  );
}