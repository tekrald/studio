
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ArrowRight, Lock, Users, Briefcase, BarChart3, Network, GitFork, ShieldCheck, Feather } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-lato">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-pink-100 via-gray-100 to-gray-200">
          <div className="absolute inset-0 opacity-30">
             {/* Decorative background image or pattern can go here */}
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))]">
                  Crie seu contrato de casamento personalizado
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto md:mx-0">
                  Sua plataforma segura e intuitiva para gestão de patrimônio familiar. Visualize sua holding, organize ativos e planeje o futuro com clareza e colaboração.
                </p>
                <Button size="lg" asChild className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] text-white shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg px-10 py-6">
                  <Link href="/signup">
                    Comece a Organizar Agora <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center items-center bg-transparent">
                <Image
                  src="/hero-contract-illustration.png"
                  alt="Ilustração de um contrato de casamento domedome"
                  width={500}
                  height={400}
                  className="" 
                  data-ai-hint="contract illustration"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-primary">Construa Seu Legado Familiar</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              <FeatureCard
                icon={<Network className="h-12 w-12 text-primary" />}
                title="Holding Familiar Visual"
                description="Visualize e gerencie sua estrutura familiar e ativos em um canvas interativo e intuitivo."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Briefcase className="h-12 w-12 text-primary" />}
                title="Gestão Completa de Ativos"
                description="Cadastre e acompanhe ativos digitais (cripto, NFTs) e físicos (imóveis, veículos) detalhadamente."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<GitFork className="h-12 w-12 text-primary" />}
                title="Contrato da União Flexível"
                description="Defina cláusulas personalizadas para acordos de partilha, convivência e outros, adaptáveis à sua realidade."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<ShieldCheck className="h-12 w-12 text-primary" />}
                title="Privacidade e Segurança"
                description="Uma conta segura para o casal gerenciar seu patrimônio com a privacidade que sua família merece."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Users className="h-12 w-12 text-primary" />}
                title="Planejamento Colaborativo"
                description="Perfis colaborativos para que o casal trabalhe junto na organização e planejamento do futuro financeiro."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Feather className="h-12 w-12 text-primary" />}
                title="Formalização Orientada"
                description="Receba orientações e registre suas intenções sobre a formalização legal da sua holding familiar."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-20 bg-primary/10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-primary">Prontos para o Próximo Nível?</h2>
            <p className="text-lg text-foreground/80 mb-10 max-w-2xl mx-auto">
              Crie sua conta domedome hoje e transforme a maneira como vocês gerenciam o patrimônio familiar. Simples, seguro e colaborativo.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] text-white shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg px-10 py-6">
              <Link href="/signup">
                Crie Sua Conta Gratuita <ArrowRight className="ml-2 h-5 w-5" />
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
  titleColor?: string;
  descriptionColor?: string;
  iconBg?: string;
}

function FeatureCard({ icon, title, description, titleColor = "text-card-foreground", descriptionColor = "text-foreground/70", iconBg = "bg-primary/10" }: FeatureCardProps) {
  return (
    <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-start text-left">
      <div className={`mb-5 p-3 rounded-full ${iconBg}`}>{icon}</div>
      <h3 className={`text-3xl font-bold mb-3 ${titleColor}`}>{title}</h3>
      <p className={`${descriptionColor} text-base leading-relaxed`}>{description}</p>
    </div>
  );
}
