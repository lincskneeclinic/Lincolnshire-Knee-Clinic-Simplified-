import React from "react";

interface PortalModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const MAX_WIDTH_CLASSES: Record<NonNullable<PortalModalProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function PortalModal({ isOpen, onClose, title, children, footer, maxWidth = "lg" }: PortalModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-deep-navy/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`bg-primary-navy border border-white/10 rounded-2xl w-full p-6 shadow-2xl space-y-5 ${MAX_WIDTH_CLASSES[maxWidth]}`}
      >
        {title && (
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white/80 cursor-pointer text-lg leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {children}
        {footer && <div className="flex justify-end gap-2 pt-1">{footer}</div>}
      </div>
    </div>
  );
}
