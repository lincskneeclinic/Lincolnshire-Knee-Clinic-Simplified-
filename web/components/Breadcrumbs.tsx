import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = "",
}) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`font-sans text-xs md:text-sm text-text-muted py-2 ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 md:gap-2">
        <li>
          <Link
            href="/"
            className="hover:text-muted-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-muted-teal"
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li aria-hidden="true" className="select-none">
                &gt;
              </li>
              <li>
                {isLast || !item.href ? (
                  <span aria-current="page" className="text-text-secondary font-medium">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-muted-teal transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-muted-teal"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
