
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ArrowRight, Lock, Users, Briefcase, BarChart3 } from 'lucide-react';

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
              Sua plataforma segura e intuitiva para gestão de patrimônio familiar. Organize, visualize e planeje o futuro dos seus ativos com clareza e colaboração.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link href="/signup">
                Comece a Organizar <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-pacifico text-center mb-12 text-primary">Recursos para o Seu Legado</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Image src="https://placehold.co/80x80.png" alt="Conta Segura" width={80} height={80} className="rounded-full" data-ai-hint="secure account" />}
                title="Conta Segura de Casal"
                description="Um login único e seguro para o casal gerenciar suas finanças e patrimônio em conjunto."
              />
              <FeatureCard
                icon={<Image src="https://placehold.co/80x80.png" alt="Perfis Colaborativos" width={80} height={80} className="rounded-full" data-ai-hint="couple profile" />}
                title="Perfis Colaborativos"
                description="Configurem seus perfis e trabalhem juntos na organização dos ativos da família."
              />
              <FeatureCard
                icon={<Image src="https://placehold.co/80x80.png" alt="Gestão de Ativos" width={80} height={80} className="rounded-full" data-ai-hint="asset management" />}
                title="Gestão Detalhada de Ativos"
                description="Cadastre e acompanhe ativos digitais (criptomoedas, NFTs) e físicos (imóveis, veículos)."
              />
              <FeatureCard
                icon={<Image src="https://placehold.co/80x80.png" alt="Planejamento Futuro" width={80} height={80} className="rounded-full" data-ai-hint="financial planning chart" />}
                title="Visão Clara para o Futuro"
                description="Tenha uma visão consolidada do seu patrimônio para tomar decisões informadas e planejar seu legado."
              />
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-20 bg-primary/10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-pacifico mb-6 text-primary">Prontos para Construir o Futuro?</h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-xl mx-auto">
              Crie sua conta domedome hoje e transforme a maneira como vocês gerenciam o patrimônio familiar. Simples, seguro e colaborativo.
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
