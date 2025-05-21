
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [avatarText, setAvatarText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    if (displayName) {
      const names = displayName.split('&').map(name => name.trim());
      if (names.length > 1 && names[0] && names[1]) {
        setAvatarText(`${names[0][0]}${names[1][0]}`);
      } else if (names.length === 1 && names[0]) {
        setAvatarText(names[0].substring(0, 2).toUpperCase());
      } else {
        setAvatarText(displayName.substring(0,2).toUpperCase() || '??');
      }
    } else if (user?.email) {
      setAvatarText(user.email.substring(0,2).toUpperCase());
    } else {
       setAvatarText('??');
    }
  }, [displayName, user?.email]);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProfile(displayName);
      toast({
        title: 'Perfil Atualizado',
        description: 'Suas informações de perfil foram salvas.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar perfil. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
     return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <UserCircle className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-pacifico">Nosso Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações compartilhadas do casal aqui. Este nome será usado em todo o aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 text-3xl ring-4 ring-primary ring-offset-background ring-offset-2">
              <AvatarImage src={`https://placehold.co/150x150.png?text=${avatarText}`} alt={displayName} data-ai-hint="couple avatar" />
              <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] text-white">
                {avatarText || '??'}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">As iniciais do avatar são baseadas no seu nome de exibição.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição do Casal (ex: Alex & Jamie)</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="ex: Alex & Jamie"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Endereço de Email Compartilhado</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled 
                className="cursor-not-allowed bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">O endereço de email não pode ser alterado aqui.</p>
            </div>
            
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
