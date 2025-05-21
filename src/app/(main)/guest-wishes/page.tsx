
"use client";
import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Gift, MessageSquare, Send, Loader2, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Wish {
  id: string;
  name: string;
  message: string;
  virtualGift?: string;
  timestamp: Date;
  avatarText: string;
}

const GUEST_WISHES_STORAGE_KEY = 'domedomeGuestWishes';

export default function GuestWishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [virtualGift, setVirtualGift] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWishes = localStorage.getItem(GUEST_WISHES_STORAGE_KEY);
      if (storedWishes) {
        const parsedWishes = JSON.parse(storedWishes).map((wish: any) => ({
          ...wish,
          timestamp: new Date(wish.timestamp) 
        }));
        setWishes(parsedWishes);
      }
    } catch (error) {
      console.error("Falha ao carregar votos do localStorage", error);
    }
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast({ title: "Espere um pouco!", description: "Por favor, insira seu nome e uma mensagem.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newWish: Wish = {
      id: new Date().toISOString(),
      name,
      message,
      virtualGift: virtualGift.trim() || undefined,
      timestamp: new Date(),
      avatarText: name.substring(0, 2).toUpperCase(),
    };

    const updatedWishes = [newWish, ...wishes];
    setWishes(updatedWishes);
    localStorage.setItem(GUEST_WISHES_STORAGE_KEY, JSON.stringify(updatedWishes));

    toast({
      title: 'Voto Enviado!',
      description: 'Obrigado pela sua linda mensagem.',
    });

    setName('');
    setMessage('');
    setVirtualGift('');
    setIsLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="shadow-xl sticky top-24">
          <CardHeader>
            <CardTitle className="text-3xl font-pacifico flex items-center">
              <MessageSquare className="mr-3 h-8 w-8 text-primary" />
              Compartilhe Seus Votos
            </CardTitle>
            <CardDescription>Deixe uma mensagem e um presente virtual para o casal feliz!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Seu Nome</Label>
                <Input id="name" placeholder="ex: Tia Maria" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Sua Mensagem</Label>
                <Textarea id="message" placeholder="Desejando a vocês uma vida inteira de felicidade..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="virtualGift">Presente Virtual (Opcional)</Label>
                <Input id="virtualGift" placeholder="ex: Fundo para uma escapada de fim de semana" value={virtualGift} onChange={(e) => setVirtualGift(e.target.value)} disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar Seu Voto
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="shadow-xl">
          <CardHeader>
             <CardTitle className="text-3xl font-pacifico flex items-center">
              <Heart className="mr-3 h-8 w-8 text-primary" />
              Mensagens de Amor
            </CardTitle>
            <CardDescription>Leia os maravilhosos votos de amigos e familiares.</CardDescription>
          </CardHeader>
          <CardContent>
            {wishes.length === 0 && !isLoading ? (
              <div className="text-center py-10 text-muted-foreground">
                <Gift className="mx-auto h-12 w-12 mb-4" />
                <p>Nenhum voto ainda. Seja o primeiro a parabenizar o casal!</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {wishes.map((wish) => (
                    <Card key={wish.id} className="bg-background/50 shadow-md">
                      <CardHeader className="flex flex-row items-start space-x-4 pb-3">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                          <AvatarImage src={`https://placehold.co/40x40.png?text=${wish.avatarText}`} alt={wish.name} data-ai-hint="guest avatar" />
                          <AvatarFallback className="bg-accent text-accent-foreground">{wish.avatarText}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-primary">{wish.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(wish.timestamp, { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-foreground/90 whitespace-pre-wrap">{wish.message}</p>
                        {wish.virtualGift && (
                          <div className="mt-3 pt-3 border-t border-border flex items-center text-sm text-accent-foreground">
                            <Gift className="h-4 w-4 mr-2 text-accent" />
                            <span>Presente Virtual: {wish.virtualGift}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
