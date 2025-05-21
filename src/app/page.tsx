
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-pink-100 via-orange-50 to-yellow-50">
          <div className="absolute inset-0 opacity-30">
             {/* Decorative background image or pattern can go here */}
          </div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-pacifico mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))]">
              Bem-vindo ao domedome
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto">
              Sua jornada mágica para o 'Sim, eu aceito' começa aqui. Planeje, compartilhe e celebre sua história de amor com ferramentas criadas para o seu dia especial.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link href="/signup">
                Comece Sua Jornada <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-pacifico text-center mb-12 text-primary">Recursos para Valorizar</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Image src="https://placehold.co/80x80.png" alt="Conta Unificada" width={80} height={80} className="rounded-full" data-ai-hint="couple login" />}
                title="Conta Unificada"
                description="Uma conta compartilhada para o casal feliz. Fácil de gerenciar, segura e sempre sincronizada."
              />
              <FeatureCard
                icon={<Image src="https://placehold.co/80x80.png" alt="Perfis Dinâmicos" width={80} height={80} className="rounded-full" data-ai-hint="profile avatar" />}
                title="Perfis Dinâmicos"
                description="Personalize seu hub de casamento. Avatares e detalhes que refletem sua história de amor única."
              />
              <FeatureCard
                icon={<Image src="https://placehold.co/80x80.png" alt="Votos dos Convidados" width={80} height={80} className="rounded-full" data-ai-hint="guest book" />}
                title="Votos dos Convidados"
                description="Um espaço lindo para os convidados compartilharem seu amor, parabéns e presentes virtuais."
              />
              <FeatureCard
                icon={<Image src="https://placehold.co/80x80.png" alt="Escritor de Discursos IA" width={80} height={80} className="rounded-full" data-ai-hint="writing speech" />}
                title="Escritor de Discursos IA"
                description="Crie o discurso de casamento perfeito com assistência de IA. Emocionante, divertido e unicamente seu."
              />
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-20 bg-primary/10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-pacifico mb-6 text-primary">Pronto para Começar?</h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-xl mx-auto">
              Crie sua conta domedome hoje e desbloqueie todas as ferramentas que você precisa para uma experiência de casamento inesquecível.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link href="/signup">
                Comece Gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center text-center">
      <div className="mb-4 text-accent">{icon}</div>
      <h3 className="text-2xl font-pacifico mb-2 text-primary">{title}</h3>
      <p className="text-foreground/70 text-sm">{description}</p>
    </div>
  );
}
