// components/navigation/NavDropdown.tsx
import Link from "next/link";
import React from "react";

interface NavItem {
  name: string;
  slug: string;
  [key: string]: any; // For extra properties like isAbsolute
}

interface NavDropdownProps {
  title: string;
  href: string;
  items: NavItem[];
  linkFormatter?: (item: NavItem) => string;
  displayFormatter?: (item: NavItem) => string;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({ title, href, items, linkFormatter, displayFormatter }) => {
  return (
    <div className="relative group">
      <Link href={href} className="px-4 py-2 font-medium text-neutral-800 flex items-center hover:text-teal-600">
        {title}
        <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </Link>
      <div className="absolute left-0 top-full hidden group-hover:block bg-white shadow-lg rounded-md z-10 min-w-[200px]">
        <ul className="py-2">
          {items.map((item) => (
            <li key={item.slug}>
              <Link href={linkFormatter ? linkFormatter(item) : item.slug} className="block px-4 py-2 text-sm hover:bg-gray-100">
                {displayFormatter ? displayFormatter(item) : item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};