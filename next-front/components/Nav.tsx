'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Coins, Shield, Sword, ScrollText, type LucideIcon } from 'lucide-react';

const LINKS: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: '/about',      label: 'The Lore',      Icon: BookOpen },
  { href: '/assets',     label: 'The Vault',     Icon: Coins },
  { href: '/',           label: 'My Fighters',   Icon: Shield },
  { href: '/challenges', label: 'The Pit',       Icon: Sword },
  { href: '/history',    label: 'Chronicles',    Icon: ScrollText },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col">
      <div className="bg-[#14110f] border-2 border-stone-800 overflow-hidden divide-y divide-stone-800/50 shadow-xl">
        {LINKS.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
                active ? 'text-amber-200 bg-stone-900/40' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900/20'
              }`}
            >
              {active && (
                <div className="absolute left-0 w-1 h-full bg-amber-700 shadow-[0_0_8px_#78350f]" />
              )}
              <Icon size={18} />
              <span className="font-serif tracking-widest uppercase text-sm">{label}</span>
              <span className={`ml-auto text-xs opacity-0 group-hover:opacity-100 transition-opacity ${
                active ? 'opacity-100' : ''
              }`}>›</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 relative">
        <div className="absolute inset-0 bg-amber-900/10 blur-xl rounded" />
        <Link
          href="/"
          className="relative w-full bg-[#2a120a] hover:bg-[#3d1a0e] border-2 border-amber-900 text-amber-100 py-4 font-bold flex flex-col items-center justify-center gap-1.5 transition-all group shadow-2xl block text-center"
        >
          <span className="text-xl group-hover:scale-110 transition-transform inline-block">+</span>
          <span className="tracking-[0.2em] uppercase text-xs">Forge a Challenge</span>
        </Link>
      </div>
    </aside>
  );
}
