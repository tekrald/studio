
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ArrowRight, Lock, Users, Briefcase, BarChart3, ShieldCheck, FileSignature, Wallet, Brain } from 'lucide-react'; // Brain para AI, Wallet para cripto

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-lato">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-pink-100 via-gray-100 to-[#f0f0f0]">
          <div className="absolute inset-0 opacity-5">
             {/* Decorative background image or pattern can go here */}
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold font-lato mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gradient-green to-gradient-blue">
                  Crie seu contrato de casamento personalizado
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto md:mx-0">
                  Ipê Acta: Sua plataforma para formalizar acordos matrimoniais e organizar sua holding familiar, com integração para ativos digitais e físicos.
                </p>
                <Button size="lg" asChild className="bg-gradient-to-r from-gradient-green to-gradient-blue text-black font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg px-10 py-6">
                  <Link href="/signup">
                    Crie Seu Contrato <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center items-center bg-transparent">
                <Image
                  src="/hero-contract-illustration.png"
                  alt="Ilustração de contrato de casamento e holding familiar"
                  width={500}
                  height={400}
                  className=""
                  data-ai-hint="casamento finanças"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-gradient-green to-gradient-blue">Organize Seu Futuro a Dois</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              <FeatureCard
                icon={<FileSignature className="h-12 w-12 text-gradient-blue" />}
                title="Contratos Personalizáveis"
                description="Defina cláusulas claras para seu casamento, partilha de bens e acordos de convivência."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Briefcase className="h-12 w-12 text-gradient-blue" />}
                title="Gestão de Holding Familiar"
                description="Organize o patrimônio da união, incluindo ativos físicos e digitais, em um canvas interativo."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Wallet className="h-12 w-12 text-gradient-blue" />}
                title="Integração com Carteiras Cripto"
                description="Conecte suas carteiras digitais para visualizar e gerenciar seus criptoativos diretamente na plataforma (simulado)."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Users className="h-12 w-12 text-gradient-green" />}
                title="Hierarquia Familiar Visual"
                description="Adicione membros da família e visualize as conexões e designações de ativos de forma clara."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-accent/10"
              />
              <FeatureCard
                icon={<BarChart3 className="h-12 w-12 text-gradient-green" />}
                title="Planejamento Patrimonial"
                description="Defina condições de liberação de ativos para membros da família, facilitando o planejamento sucessório."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-accent/10"
              />
               <FeatureCard
                icon={<ShieldCheck className="h-12 w-12 text-gradient-green" />}
                title="Privacidade e Segurança"
                description="Gerencie seus acordos e ativos com a confidencialidade e segurança que sua união merece."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-accent/10"
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gradient-green to-gradient-blue">Prontos para Oficializar Seus Acordos?</h2>
            <p className="text-lg text-foreground/80 mb-10 max-w-2xl mx-auto">
              Crie sua conta no Ipê Acta hoje e transforme a maneira como vocês gerenciam seus acordos e patrimônio.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-gradient-green to-gradient-blue text-black font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg px-10 py-6">
              <Link href="/signup">
                Comece Agora <ArrowRight className="ml-2 h-5 w-5" />
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

function FeatureCard({ icon, title, description, titleColor = "text-card-foreground", descriptionColor = "text-foreground/80", iconBg = "bg-primary/10" }: FeatureCardProps) {
  return (
    <div className="bg-card p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-start text-left border border-border">
      <div className={`mb-5 p-3 rounded-full ${iconBg}`}>{icon}</div>
      <h3 className={`text-3xl font-bold mb-3 ${titleColor} font-lato`}>{title}</h3>
      <p className={`${descriptionColor} text-base leading-relaxed`}>{description}</p>
    </div>
  );
}
