"use client";

import { useState } from "react";

type ConnectorType = "WOOCOMMERCE" | "FACEBOOK" | "LINKEDIN";

interface QuotaData {
  limit: number;
  used_items: string[];
}

// Added licenseKey to props so we can authorize the deletion
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
    if(!confirm(`Are you sure you want to remove ${itemToRemove}? This will free up a seat.`)) return;
    
    setLoading(true);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_HUB_URL}/removeSeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                licenseKey: licenseKey,
                source: type,
                itemToRemove: itemToRemove
            })
        });

        if (response.ok) {
            alert("Seat removed successfully!");
            window.location.reload(); // Simple refresh to show new data
        } else {
            const err = await response.text();
            alert("Error removing seat: " + err);
        }

    } catch (e) {
        console.error(e);
        alert("Failed to connect to server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg leading-6 font-medium text-gray-900">
        Connector Usage & Quotas
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(quotas).map(([key, data]) => {
          const type = key as ConnectorType;
          const usagePercent = data.limit > 0 ? (data.used_items.length / data.limit) * 100 : 0;
          const isFull = data.used_items.length >= data.limit;
          const isExpanded = expandedType === type;

          if (data.limit === 0) return null;

          return (
            <div
              key={type}
              className={`bg-white overflow-hidden shadow rounded-lg border transition-all ${
                isFull ? "border-amber-200" : "border-gray-200"
              }`}
            >
              <div className="px-4 py-5 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                      {type.substring(0, 2)}
                    </span>
                    <h3 className="ml-2 text-md font-medium text-gray-900">
                      {type === "WOOCOMMERCE" ? "WooCommerce" : "Facebook Ads"}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isFull
                        ? "bg-amber-100 text-amber-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {data.used_items.length} / {data.limit} Seats
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div
                    className={`h-2.5 rounded-full ${
                      isFull ? "bg-amber-500" : "bg-brand"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  ></div>
                </div>

                {/* Manage Button */}
                <button
                  onClick={() => toggleExpand(type)}
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  {isExpanded ? "Hide Details" : "Manage Seats"}
                </button>

                {/* Expanded List */}
                {isExpanded && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <ul className="space-y-3">
                      {data.used_items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center text-sm">
                          <span className="truncate max-w-[160px] text-gray-600" title={item}>
                            {item.replace("https://", "")}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(type, item)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                          >
                            {loading ? "..." : "Remove"}
                          </button>
                        </li>
                      ))}
                      {data.used_items.length === 0 && (
                        <li className="text-xs text-gray-400 italic">No seats used yet.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}