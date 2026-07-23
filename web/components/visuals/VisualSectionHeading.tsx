import React from "react";

interface VisualSectionHeadingProps {
  title: string;
  subtitle?: string;
  category?: string;
  className?: string;
}

export const VisualSectionHeading: React.FC<VisualSectionHeadingProps> = ({
  title,
  subtitle,
  category,
  className = "",
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {category && (
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-clinical-teal block mb-1">
          {category}
        </span>
      )}
      <h3 className="font-sans text-base md:text-lg font-bold text-deep-navy uppercase tracking-wider border-b border-border-clinical/30 pb-1.5">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-text-secondary font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
