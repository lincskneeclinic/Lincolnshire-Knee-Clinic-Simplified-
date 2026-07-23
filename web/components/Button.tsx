import React from "react";
import Link from "next/link";

interface ButtonProps {
  variant?: "primary" | "secondary" | "teal";
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  href,
  target,
  rel,
}) => {
  const baseStyle =
    "inline-flex items-center justify-center min-h-[48px] px-6 py-2.5 rounded-lg font-sans font-semibold text-base transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clinical-teal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-primary-navy hover:bg-deep-navy text-white border border-transparent shadow-[0_2px_4px_rgba(0,59,92,0.08)]",
    secondary: "bg-white hover:bg-soft-blue text-deep-navy border border-deep-navy",
    teal: "bg-clinical-teal hover:bg-clinical-teal-hover text-white border border-transparent shadow-[0_2px_4px_rgba(0,175,200,0.1)]",
  };

  const combinedClassName = `${baseStyle} ${variantStyles[variant]} ${className}`;

  if (href) {
    const isExternalOrProtocol =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#");

    if (isExternalOrProtocol) {
      return (
        <a href={href} className={combinedClassName} onClick={onClick as any} target={target} rel={rel}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={combinedClassName} onClick={onClick} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
