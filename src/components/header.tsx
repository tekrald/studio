
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, UserCircle, LogIn, LogOut, Wallet } from 'lucide-react'; // Added Wallet
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-provider';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Contract', icon: Briefcase },
  { href: '/profile', label: 'My Record', icon: UserCircle },
  { href: '/wallet', label: 'Wallet', icon: Wallet }, // New Wallet Link
];

export function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg" // Updated to logo.svg as per previous changes
            alt="Ipê Acta Logo"
            width={150} // Adjusted as per recent logo size change
            height={50} // Adjusted for a 3:1 aspect ratio with width 150
            className="h-auto"
            priority
            data-ai-hint="logo IpêActa"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </Link>

        {user && (
          <nav className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const label = link.href === '/profile' && user?.displayName ? user.displayName : link.label;
              const isWalletLink = link.href === '/wallet';
              
              if (isWalletLink && !user?.isWalletConnected) {
                return null; // Don't show wallet link if no wallet is connected
              }

              return (
                <Button key={link.href} variant="ghost" asChild
                  className={cn(
                    "text-sm text-foreground/80 hover:text-primary hover:bg-primary/10",
                    pathname === link.href ? "bg-primary/10 text-primary font-semibold" : ""
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
            <div className="h-8 w-20 bg-muted/50 rounded-md animate-pulse"></div>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" onClick={logout} className="text-foreground/80 hover:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              {!pathname.includes('/login') && !pathname.includes('/signup') && (
                <Button variant="ghost" size="sm" asChild className="text-foreground/80 hover:text-primary">
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Link>
                </Button>
              )}
              {!pathname.includes('/signup') && !pathname.includes('/login') &&(
                 <Button size="sm" asChild className="bg-gradient-to-r from-gradient-green to-gradient-blue text-black font-semibold hover:opacity-90">
                  <Link href="/signup">
                    Register
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
              const label = link.href === '/profile' && user?.displayName 
                ? user.displayName.split('&')[0]?.trim() || user.displayName.split('And')[0]?.trim() || 'Profile' 
                : link.label;

              const isWalletLink = link.href === '/wallet';
              if (isWalletLink && !user?.isWalletConnected) {
                return null; // Don't show wallet link if no wallet is connected
              }

              return (
                <Button key={link.href} variant="ghost" size="sm" asChild
                  className={cn(
                    "flex-col h-auto p-1 text-foreground/70 hover:text-primary",
                    pathname === link.href ? "bg-primary/10 text-primary" : ""
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

    