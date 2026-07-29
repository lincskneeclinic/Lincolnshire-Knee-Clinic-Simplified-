import React from "react";
import Link from "next/link";
import Image from "next/image";

interface CardProps {
  title: string;
  description: string;
  href?: string;
  linkText?: string;
  category?: string;
  icon?: React.ReactNode;
  imageUrl?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  href,
  linkText = "Read more",
  category,
  icon,
  imageUrl,
  className = "",
}) => {
  const cardContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {imageUrl && (
          <div className="w-full h-40 relative rounded-lg overflow-hidden mb-4 border border-border-clinical/30 bg-white">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        {category && (
          <span className="text-xs font-bold uppercase tracking-widest text-clinical-teal mb-4 block font-sans">
            {category}
          </span>
        )}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
          {icon && (
            <div className="w-12 h-12 rounded-full bg-clinical-teal text-white flex items-center justify-center shrink-0 shadow-sm">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-sans text-lg md:text-xl font-bold text-deep-navy leading-snug">
              {title}
            </h3>
            <p className="font-sans text-text-secondary text-base leading-relaxed mt-2.5">
              {description}
            </p>
          </div>
        </div>
      </div>
      {href && (
        <div className="mt-4 pt-4 border-t border-border-clinical/30 flex items-center text-clinical-teal font-sans font-semibold group-hover:text-clinical-teal-hover transition-colors">
          <span>{linkText}</span>
          <svg
            className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );

  const containerClasses = `bg-soft-blue border border-transparent rounded-xl p-6 md:p-8 transition-all duration-200 group relative block shadow-[0_4px_20px_rgba(8,47,73,0.02)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-clinical-teal ${
    href ? "hover:bg-white hover:border-clinical-teal hover:shadow-[0_8px_30px_rgba(8,47,73,0.06)] cursor-pointer" : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={containerClasses}>
        {cardContent}
      </Link>
    );
  }

  return <div className={containerClasses}>{cardContent}</div>;
};
