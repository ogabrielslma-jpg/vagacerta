import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DasBank — O banco que trabalha do seu jeito',
  description: 'Conta digital gratuita PF e PJ. Cartão sem anuidade, PIX ilimitado, e tudo que você precisa pra fazer seu dinheiro render. Abra sua conta em 5 minutos.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
