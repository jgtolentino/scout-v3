import React from "react";

// Non-blocking floating badge for Ask Scout API status
const ScoutStatusBadge: React.FC = () => (
  <div
    style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      padding: "12px 20px",
      fontSize: 14,
      color: "#111827",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
    aria-label="Ask Scout API Status"
  >
    <span style={{ fontWeight: 600 }}>Ask Scout API</span>
    <span style={{ color: "#10b981" }}>●</span>
    <span style={{ fontSize: 13 }}>79% confidence</span>
    <span style={{ fontSize: 13, color: "#6b7280" }}>446ms</span>
  </div>
);

export default ScoutStatusBadge;
