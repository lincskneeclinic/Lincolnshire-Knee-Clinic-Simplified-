import React from "react";

interface PortalEmptyStateProps {
  message: React.ReactNode;
  className?: string;
}

export function PortalEmptyState({ message, className = "" }: PortalEmptyStateProps) {
  return (
    <div className={`text-center text-white/40 text-xs py-12 border border-dashed border-white/10 rounded-xl ${className}`}>
      {message}
    </div>
  );
}
