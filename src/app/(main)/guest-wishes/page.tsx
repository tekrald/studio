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
          timestamp: new Date(wish.timestamp) // Ensure timestamp is a Date object
        }));
        setWishes(parsedWishes);
      }
    } catch (error) {
      console.error("Failed to load wishes from localStorage", error);
    }
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast({ title: "Hold on!", description: "Please enter your name and a message.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    // Simulate API call
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
      title: 'Wish Sent!',
      description: 'Thank you for your lovely message.',
    });

    // Reset form
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
              Share Your Wishes
            </CardTitle>
            <CardDescription>Leave a message and a virtual gift for the happy couple!</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" placeholder="e.g., Aunt Mary" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Your Message</Label>
                <Textarea id="message" placeholder="Wishing you a lifetime of happiness..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="virtualGift">Virtual Gift (Optional)</Label>
                <Input id="virtualGift" placeholder="e.g., A weekend getaway fund" value={virtualGift} onChange={(e) => setVirtualGift(e.target.value)} disabled={isLoading} />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Your Wish
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
              Messages of Love
            </CardTitle>
            <CardDescription>Read the wonderful wishes from friends and family.</CardDescription>
          </CardHeader>
          <CardContent>
            {wishes.length === 0 && !isLoading ? (
              <div className="text-center py-10 text-muted-foreground">
                <Gift className="mx-auto h-12 w-12 mb-4" />
                <p>No wishes yet. Be the first to congratulate the couple!</p>
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
                            {formatDistanceToNow(wish.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-foreground/90 whitespace-pre-wrap">{wish.message}</p>
                        {wish.virtualGift && (
                          <div className="mt-3 pt-3 border-t border-border flex items-center text-sm text-accent-foreground">
                            <Gift className="h-4 w-4 mr-2 text-accent" />
                            <span>Virtual Gift: {wish.virtualGift}</span>
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
