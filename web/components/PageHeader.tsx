import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  category,
  className = "",
}) => {
  return (
    <div className={`w-full bg-gradient-to-r from-[#003B5C] to-[#082F49] text-white py-10 md:py-14 border-b border-border-clinical/10 relative overflow-hidden rounded-xl mb-8 ${className}`}>
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-clinical-teal/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
      
      <div className="px-6 md:px-8 relative z-10">
        {category && (
          <span className="text-xs font-bold uppercase tracking-widest text-clinical-teal block mb-2 font-sans">
            {category}
          </span>
        )}
        <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold !text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="font-sans text-sm md:text-base text-[#EAF6FA] leading-relaxed mt-3 max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
