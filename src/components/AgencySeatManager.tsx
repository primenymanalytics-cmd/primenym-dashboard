"use client";

import { useState } from "react";
import { 
  ShoppingCart, 
  Facebook, 
  Linkedin, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  AlertCircle,
  ExternalLink
} from "lucide-react";

type ConnectorType = "WOOCOMMERCE" | "FACEBOOK" | "LINKEDIN";

interface QuotaData {
  limit: number;
  used_items: string[];
}

interface AgencySeatManagerProps {
  quotas: Record<ConnectorType, QuotaData>;
  licenseKey: string; 
}

export default function AgencySeatManager({ quotas, licenseKey }: AgencySeatManagerProps) {
  const [expandedType, setExpandedType] = useState<ConnectorType | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleExpand = (type: ConnectorType) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const handleRemoveItem = async (type: ConnectorType, itemToRemove: string) => {
    if(!confirm(`Are you sure you want to remove ${itemToRemove}?`)) return;
    setLoading(true);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_HUB_URL}/removeSeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey, source: type, itemToRemove })
        });
        if (response.ok) window.location.reload();
        else alert("Error removing seat.");
    } catch (e) {
        alert("Failed to connect to server.");
    } finally {
        setLoading(false);
    }
  };

  // Helper to get Icon and Colors based on type
  const getConnectorStyle = (type: string) => {
    switch (type) {
        case "WOOCOMMERCE": return { icon: ShoppingCart, color: "text-purple-600", bg: "bg-purple-100", bar: "bg-purple-600" };
        case "FACEBOOK": return { icon: Facebook, color: "text-blue-600", bg: "bg-blue-100", bar: "bg-blue-600" };
        case "LINKEDIN": return { icon: Linkedin, color: "text-blue-700", bg: "bg-blue-100", bar: "bg-blue-700" };
        default: return { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-100", bar: "bg-gray-600" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          Active Connectors
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(quotas).map(([key, data]) => {
          const type = key as ConnectorType;
          if (data.limit === 0) return null; // Don't show empty plans

          const { icon: Icon, color, bg, bar } = getConnectorStyle(type);
          const usageCount = data.used_items.length;
          const limit = data.limit;
          const usagePercent = (usageCount / limit) * 100;
          const isFull = usageCount >= limit;
          const isExpanded = expandedType === type;

          return (
            <div
              key={type}
              className={`group relative bg-white overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-lg ${
                isFull ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-200 shadow-sm"
              }`}
            >
              <div className="p-6">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quota</p>
                    <p className={`text-lg font-bold ${isFull ? "text-amber-600" : "text-gray-900"}`}>
                      {usageCount} <span className="text-gray-400 text-sm">/ {limit}</span>
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {type === "WOOCOMMERCE" ? "WooCommerce Stores" : "Ad Accounts"}
                </h3>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${isFull ? "bg-amber-500" : bar}`}
                    style={{ width: `${usagePercent}%` }}
                  ></div>
                </div>

                {/* Action Area */}
                <button
                  onClick={() => toggleExpand(type)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-gray-50 hover:bg-white hover:border-gray-300 transition-all focus:outline-none"
                >
                  {isExpanded ? (
                    <>Hide Details <ChevronUp className="ml-2 w-4 h-4" /></>
                  ) : (
                    <>Manage Seats <ChevronDown className="ml-2 w-4 h-4" /></>
                  )}
                </button>
              </div>

              {/* Expandable List */}
              {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 p-4 animate-in fade-in slide-in-from-top-2">
                  <ul className="space-y-3">
                    {data.used_items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                        <div className="flex items-center min-w-0">
                          <ExternalLink className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="truncate text-sm text-gray-600 font-medium" title={item}>
                            {item.replace("https://", "").replace(/\/$/, "")}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(type, item)}
                          disabled={loading}
                          className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Revoke License"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                    {data.used_items.length === 0 && (
                      <li className="text-sm text-gray-400 text-center py-2 italic">
                        No seats used. Connect a store to see it here.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}