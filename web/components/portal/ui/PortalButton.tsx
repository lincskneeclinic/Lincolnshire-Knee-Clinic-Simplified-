import React from "react";

type PortalButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface PortalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PortalButtonVariant;
}

const VARIANT_CLASSES: Record<PortalButtonVariant, string> = {
  primary: "bg-clinical-teal hover:bg-clinical-teal-hover text-deep-navy",
  secondary: "border border-white/20 text-white/80 hover:bg-white/5",
  danger: "bg-status-error/90 hover:bg-status-error text-white",
  ghost: "text-white/60 hover:text-white underline",
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
