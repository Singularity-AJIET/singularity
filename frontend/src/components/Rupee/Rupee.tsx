import React from "react";

export default function Rupee({ className = "" }: { className?: string }) {
  return <span className={`rupee ${className}`}>₹</span>;
}

export function withRupee(text: string): React.ReactNode {
  if (!text || !text.includes("₹")) return text;
  const parts = text.split("₹");
  return parts.map((part, index) => (
    <React.Fragment key={index}>
      {index > 0 && <span className="rupee">₹</span>}
      {part}
    </React.Fragment>
  ));
}
