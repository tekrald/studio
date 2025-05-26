
"use client";
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogInIcon } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!email || !password) {
        setError("Please enter email and password.");
        setIsLoading(false);
        return;
      }
      // Login simulation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulates network delay
      // In a real application, here you would call your Firebase/Auth login function
      login(email); // Using the AuthProvider mock
    } catch (err) {
      setError('Failed to log in. Check your credentials.');
      // Typically, you would handle specific Firebase Auth errors here
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gradient-green/20 via-gradient-blue/20 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card border-border">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
             <Image src="/logo.svg" alt="Ipê Acta Logo" width={250} height={83} data-ai-hint="logo IpêActa" className="rounded-full" style={{ filter: 'brightness(0) invert(1)' }}/>
          </Link>
          <CardTitle className="text-3xl font-sans text-foreground">Access Your Ipê Acta Account</CardTitle>
          <CardDescription className="font-sans text-muted-foreground">Log in to manage your contracts and holding.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/90">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/90">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-input text-foreground placeholder:text-muted-foreground border-border focus:ring-primary"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogInIcon className="mr-2 h-4 w-4" />
              )}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-accent hover:text-accent/80">
              <Link href="/signup">Sign up here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
