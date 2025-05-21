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
    title: 'Our Profile',
    description: "Share your story and manage couple's details.",
    icon: UserCircle,
    imageHint: 'couple profile',
  },
  {
    href: '/guest-wishes',
    title: 'Guest Well-Wishes',
    description: 'See messages and gifts from your loved ones.',
    icon: Gift,
    imageHint: 'wedding gifts',
  },
  {
    href: '/speech-writer',
    title: 'AI Speechwriter',
    description: 'Craft the perfect, heartfelt wedding speech.',
    icon: FileText,
    imageHint: 'writing speech',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading state, though MainAppLayout handles redirection
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
              <CardTitle className="text-4xl text-white font-pacifico">Hello, {user.displayName || 'Couple'}!</CardTitle>
              <CardDescription className="text-white/90 text-lg mt-1">
                Welcome to your domedome wedding hub. Let&apos;s make your special day unforgettable!
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
                  Go to {link.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-pacifico">Quick Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Remember to update your profile with your unique story! This helps the AI Speechwriter craft an even more personalized speech for you.
            You can also share details with your guests through your profile.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
