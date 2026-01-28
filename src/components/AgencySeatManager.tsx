"use client";

import { useState } from "react";

// Types to define our data structure
type ConnectorType = "WOOCOMMERCE" | "FACEBOOK" | "LINKEDIN";

interface QuotaData {
  limit: number;
  used_items: string[]; // URLs or Account IDs
}

interface AgencySeatManagerProps {
  quotas: Record<ConnectorType, QuotaData>; // The map from Firestore
}

export default function AgencySeatManager({ quotas }: AgencySeatManagerProps) {
  // We keep track of which card is "expanded" to show the list of URLs
  const [expandedType, setExpandedType] = useState<ConnectorType | null>(null);

  const toggleExpand = (type: ConnectorType) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const handleRemoveItem = async (type: ConnectorType, itemToRemove: string) => {
    // TODO: Connect this to your Backend API (Phase 2)
    alert(`This would remove ${itemToRemove} from ${type} quota.`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg leading-6 font-medium text-gray-900">
        Connector Usage & Quotas
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(quotas).map(([key, data]) => {
          const type = key as ConnectorType;
          const usagePercent = (data.used_items.length / data.limit) * 100;
          const isFull = data.used_items.length >= data.limit;
          const isExpanded = expandedType === type;

          // If limit is 0, user hasn't bought this connector yet
          if (data.limit === 0) return null;

          return (
            <div
              key={type}
              className={`bg-white overflow-hidden shadow rounded-lg border transition-all ${
                isFull ? "border-amber-200" : "border-gray-200"
              }`}
            >
              <div className="px-4 py-5 sm:p-6">
                {/* Header: Icon + Name */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {/* Dynamic Icons based on type */}
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
                  className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  {isExpanded ? "Hide Details" : "Manage Seats"}
                </button>

                {/* Expanded List (The "Manage" View) */}
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
                            className="text-red-600 hover:text-red-800 text-xs font-medium"
                          >
                            Remove
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

        {/* Upsell Card (Appears if they don't have all connectors) */}
        <div className="bg-gray-50 overflow-hidden shadow rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-sm font-medium text-gray-900">Need more power?</h3>
          <p className="mt-1 text-xs text-gray-500 mb-4">
            Add Facebook or LinkedIn to your plan.
          </p>
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-brand bg-brand-100 hover:bg-brand-200 text-brand-700">
            Add Connector +
          </button>
        </div>
      </div>
    </div>
  );
}