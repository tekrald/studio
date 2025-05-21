
"use client";
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle, Gift, FileText, ArrowRight, Heart } from 'lucide-react';
import Image from 'next/image';

const featureLinks = [
  {
    href: '/profile',
    title: 'Nosso Perfil',
    description: "Compartilhe sua história e gerencie os detalhes do casal.",
    icon: UserCircle,
    imageHint: 'couple profile',
  },
  {
    href: '/guest-wishes',
    title: 'Votos dos Convidados',
    description: 'Veja mensagens e presentes de seus entes queridos.',
    icon: Gift,
    imageHint: 'wedding gifts',
  },
  {
    href: '/speech-writer',
    title: 'Escritor de Discursos IA',
    description: 'Crie o discurso de casamento perfeito e emocionante.',
    icon: FileText,
    imageHint: 'writing speech',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null; 
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-xl bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))]">
        <CardHeader className="p-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-4xl text-white font-pacifico">Olá, {user.displayName || 'Casal'}!</CardTitle>
              <CardDescription className="text-white/90 text-lg mt-1">
                Bem-vindo(a) ao seu hub de casamento domedome. Vamos tornar seu dia especial inesquecível!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureLinks.map((link) => (
          <Card key={link.href} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
            <CardHeader className="flex-row items-center space-x-4 pb-4">
              <Image src={`https://placehold.co/64x64.png`} alt={link.title} width={64} height={64} data-ai-hint={link.imageHint} className="rounded-lg" />
              <div>
                <CardTitle className="text-2xl font-pacifico text-primary">{link.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm mb-4">{link.description}</p>
            </CardContent>
            <div className="p-4 pt-0">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href={link.href}>
                  Ir para {link.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-pacifico">Dica Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Lembre-se de atualizar seu perfil com sua história única! Isso ajuda o Escritor de Discursos IA a criar um discurso ainda mais personalizado para vocês.
            Você também pode compartilhar detalhes com seus convidados através do seu perfil.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
