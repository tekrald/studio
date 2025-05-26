
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ArrowRight, Lock, Users, Briefcase, BarChart3, Network, GitFork, ShieldCheck, Feather, FileSignature, Landmark, DatabaseZap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-lato">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-gradient-green via-gradient-blue to-background">
          <div className="absolute inset-0 opacity-5">
             {/* Decorative background image or pattern can go here */}
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold font-lato mb-6 text-foreground">
                  Acta Ipê: Registre seus Acordos em Ipê City
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto md:mx-0">
                  Sua plataforma segura e intuitiva para gestão de registros, ativos e acordos na network state Ipê City.
                </p>
                <Button size="lg" asChild className="bg-gradient-to-r from-gradient-green to-gradient-blue text-black font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg px-10 py-6">
                  <Link href="/signup">
                    Crie seu Registro <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center items-center bg-transparent">
                <Image
                  src="/hero-contract-illustration.png"
                  alt="Ilustração de registros em Ipê City"
                  width={500}
                  height={400}
                  className="" 
                  data-ai-hint="network state city"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-gradient-green to-gradient-blue">Sua Base em Ipê City</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              <FeatureCard
                icon={<Network className="h-12 w-12 text-gradient-blue" />}
                title="Visualizador de Registros"
                description="Visualize e gerencie sua estrutura social e ativos em um canvas interativo e intuitivo."
              />
              <FeatureCard
                icon={<DatabaseZap className="h-12 w-12 text-gradient-blue" />}
                title="Gestão de Ativos Digitais e Físicos"
                description="Cadastre e acompanhe ativos digitais (cripto, NFTs) e físicos (imóveis, veículos) com detalhes."
              />
              <FeatureCard
                icon={<FileSignature className="h-12 w-12 text-gradient-blue" />}
                title="Acordos Flexíveis"
                description="Defina cláusulas personalizadas para seus acordos e registros, adaptáveis à sua realidade em Ipê City."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-12 w-12 text-gradient-green" />}
                title="Privacidade e Segurança"
                description="Uma conta segura para gerenciar seus registros e ativos com a privacidade que você merece em Ipê City."
              />
              <FeatureCard
                icon={<Users className="h-12 w-12 text-gradient-green" />}
                title="Gestão Colaborativa"
                description="Perfis colaborativos para que os membros de Ipê City trabalhem juntos na organização de seus acordos."
              />
              <FeatureCard
                icon={<Landmark className="h-12 w-12 text-gradient-green" />}
                title="Formalização Orientada"
                description="Receba orientações e registre suas intenções sobre a formalização de suas entidades em Ipê City."
              />
            </div>
          </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gradient-green to-gradient-blue">Pronto para Oficializar sua Presença?</h2>
            <p className="text-lg text-foreground/80 mb-10 max-w-2xl mx-auto">
              Crie sua conta no Acta Ipê hoje e transforme a maneira como você gerencia seus registros e acordos em Ipê City.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-gradient-green to-gradient-blue text-black font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg px-10 py-6">
              <Link href="/signup">
                Crie Seu Registro Gratuito <ArrowRight className="ml-2 h-5 w-5" />
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

function FeatureCard({ icon, title, description, titleColor = "text-card-foreground", descriptionColor = "text-card-foreground/80", iconBg = "bg-primary/10" }: FeatureCardProps) {
  return (
    <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-start text-left border border-border">
      <div className={`mb-5 p-3 rounded-full ${iconBg}`}>{icon}</div>
      <h3 className={`text-3xl font-bold mb-3 ${titleColor}`}>{title}</h3>
      <p className={`${descriptionColor} text-base leading-relaxed`}>{description}</p>
    </div>
  );
}
