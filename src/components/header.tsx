
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, UserCircle, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Holding', icon: Briefcase },
  { href: '/profile', label: 'Perfil', icon: UserCircle }, // Fallback label
];

export function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/domedome-logo.svg" 
            alt="domedome Logo"
            width={250} 
            height={83}  
            className="h-auto" 
            priority 
          />
        </Link>
        
        {user && (
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const label = link.href === '/profile' ? (user?.displayName || link.label) : link.label;
              return (
                <Button key={link.href} variant="ghost" asChild
                  className={cn(
                    "text-sm",
                    pathname === link.href ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  <Link href={link.href}>
                    <link.icon className="mr-2 h-4 w-4" />
                    {label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        )}

        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
          ) : user ? (
            <>
              <span className="text-sm hidden sm:inline text-muted-foreground">
                Olá, {user.displayName || user.email?.split('@')[0]}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <>
              {!pathname.includes('/login') && !pathname.includes('/signup') && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Entrar
                  </Link>
                </Button>
              )}
              {!pathname.includes('/signup') && !pathname.includes('/login') &&(
                 <Button size="sm" asChild className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] text-white">
                  <Link href="/signup">
                    Cadastrar
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      {/* Mobile Nav */}
      {user && (
        <div className="md:hidden bg-card border-t border-border p-2 flex justify-around">
           {navLinks.map((link) => {
              const label = link.href === '/profile' ? (user?.displayName || link.label) : link.label;
              return (
                <Button key={link.href} variant="ghost" size="sm" asChild
                  className={cn(
                    "flex-col h-auto p-1",
                    pathname === link.href ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  <Link href={link.href}>
                    <link.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{label}</span>
                  </Link>
                </Button>
              );
            })}
        </div>
      )}
    </header>
  );
}
