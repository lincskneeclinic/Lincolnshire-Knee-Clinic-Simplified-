import React from "react";

interface VisualCaptionProps {
  children: React.ReactNode;
  className?: string;
}

export const VisualCaption: React.FC<VisualCaptionProps> = ({ children, className = "" }) => {
  return (
    <figcaption className={`text-xs text-text-muted italic leading-relaxed text-center mt-3 px-4 ${className}`}>
      {children}
    </figcaption>
  );
};
