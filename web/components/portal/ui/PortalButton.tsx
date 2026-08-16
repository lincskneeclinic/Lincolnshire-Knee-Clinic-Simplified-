import React from "react";

type PortalButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface PortalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PortalButtonVariant;
}

const VARIANT_CLASSES: Record<PortalButtonVariant, string> = {
  primary: "bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy",
  secondary: "border border-portal-border/20 text-portal-text/80 hover:bg-portal-text/5",
  danger: "bg-status-error/90 hover:bg-status-error text-white",
  ghost: "text-portal-text/60 hover:text-portal-text underline",
};

export function PortalButton({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...rest
}: PortalButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
