import React from "react";

interface PortalCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const PADDING_CLASSES: Record<NonNullable<PortalCardProps["padding"]>, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function PortalCard({ children, className = "", padding = "lg" }: PortalCardProps) {
  return (
    <div className={`bg-primary-navy border border-white/10 rounded-2xl shadow-lg ${PADDING_CLASSES[padding]} ${className}`}>
      {children}
    </div>
  );
}
