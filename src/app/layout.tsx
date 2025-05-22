
import type { Metadata } from 'next';
import { Lato } from 'next/font/google'; // Removido Pacifico
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/auth-provider';

// Removida a configuração da fonte Pacifico

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'], // Adicionando mais pesos se necessário
  variable: '--font-lato',
});

export const metadata: Metadata = {
  title: 'domedome - Gestão de Patrimônio Familiar',
  description: 'Organize, visualize e planeje o futuro dos seus ativos com domedome.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${lato.variable} antialiased`}> {/* Removida pacifico.variable */}
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
