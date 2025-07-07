'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookMarked, Sparkles, FilePlus2, Library } from 'lucide-react';

export function Hub() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/plans/create', label: 'Crear Plan', icon: FilePlus2 },
    { href: '/activities/create', label: 'Crear Actividad', icon: Sparkles },
    { href: '/library', label: 'Mi Biblioteca', icon: Library },
  ];

  return (
    <nav className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <BookMarked className="h-6 w-6" />
              <span>AprendeTech</span>
          </Link>
          <div className="flex items-center space-x-1 md:space-x-4">
            {navLinks.map((link) => {
              const isActive = pathname ? pathname.startsWith(link.href) : false;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
