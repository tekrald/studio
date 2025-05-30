
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ArrowRight, FileSignature, Briefcase, Wallet, Users, BarChart3, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-background">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold font-lato mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gradient-green to-gradient-blue">
                  Create your personalized marriage contract
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-2xl mx-auto md:mx-0">
                  Ipê Acta: Your platform to formalize marital agreements and organize your family holding, with integration for digital and physical assets.
                </p>
                <Button size="lg" asChild className="bg-gradient-to-r from-gradient-green to-gradient-blue text-black font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg px-10 py-6">
                  <Link href="/signup">
                    Create Your Contract <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <div className="flex justify-center items-center bg-transparent">
                <Image
                  src="/hero-imagem.png"
                  alt="Illustration of marriage contract and family holding"
                  width={500}
                  height={400}
                  data-ai-hint="marriage finance contract"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-gradient-green to-gradient-blue">Organize Your Future Together</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              <FeatureCard
                icon={<FileSignature className="h-12 w-12 text-gradient-blue" />}
                title="Customizable Contracts"
                description="Define clear clauses for your marriage, asset sharing, and cohabitation agreements."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Briefcase className="h-12 w-12 text-gradient-blue" />}
                title="Family Holding Management"
                description="Organize the union's assets, including physical and digital assets, on an interactive canvas."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Wallet className="h-12 w-12 text-gradient-blue" />}
                title="Crypto Wallet Integration"
                description="Connect your digital wallets to view and manage your crypto assets directly on the platform (simulated)."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-primary/10"
              />
              <FeatureCard
                icon={<Users className="h-12 w-12 text-gradient-green" />}
                title="Visual Family Hierarchy"
                description="Add family members and clearly visualize connections and asset assignments."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-accent/10"
              />
              <FeatureCard
                icon={<BarChart3 className="h-12 w-12 text-gradient-green" />}
                title="Estate Planning"
                description="Define asset release conditions for family members, facilitating succession planning."
                titleColor="text-card-foreground"
                descriptionColor="text-foreground/80"
                iconBg="bg-accent/10"
              />
               <FeatureCard
                icon={<ShieldCheck className="h-12 w-12 text-gradient-green" />}
                title="Privacy and Security"
                description="Manage your agreements and assets with the confidentiality and security your union deserves."
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
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-gradient-green to-gradient-blue">Ready to Formalize Your Agreements?</h2>
            <p className="text-lg text-foreground/80 mb-10 max-w-2xl mx-auto">
              Create your Ipê Acta account today and transform how you manage your agreements and assets.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-gradient-green to-gradient-blue text-black font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 text-lg px-10 py-6">
              <Link href="/signup">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
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
      <h3 className={`text-3xl font-bold mb-3 ${titleColor} font-sans`}>{title}</h3>
      <p className={`${descriptionColor} text-base leading-relaxed`}>{description}</p>
    </div>
  );
}
