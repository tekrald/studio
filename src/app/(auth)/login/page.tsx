
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
        setError("Por favor, insira email e senha.");
        setIsLoading(false);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      login(email);
    } catch (err) {
      setError('Falha ao fazer login. Verifique suas credenciais.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-100 via-orange-50 to-yellow-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
             <Image src="https://placehold.co/100x100.png" alt="domedome Logo" width={80} height={80} data-ai-hint="logo domedome" className="rounded-full"/>
          </Link>
          <CardTitle className="text-3xl font-pacifico">Bem-vindo(a) de Volta!</CardTitle>
          <CardDescription>Faça login na sua conta domedome para continuar planejando seu dia especial.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Endereço de Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogInIcon className="mr-2 h-4 w-4" />
              )}
              Entrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Button variant="link" asChild className="p-0 h-auto text-primary">
              <Link href="/signup">Cadastre-se aqui</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
