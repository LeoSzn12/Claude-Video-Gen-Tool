'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/study', label: 'Study' },
  { href: '/create', label: 'Create' },
  { href: '/templates', label: 'Templates' },
  { href: '/renders', label: 'Renders' },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm text-slate-200">
        <Link href="/create" className="text-base font-semibold text-white">
          Trailer DNA
        </Link>
        <div className="flex items-center gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? 'rounded-md bg-purple-600 px-3 py-1 text-white'
                    : 'rounded-md px-3 py-1 text-slate-300 hover:text-white'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
