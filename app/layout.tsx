import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DasBank — Conta global pra brasileiros que recebem do mundo',
  description: 'Receba pagamentos de mais de 140 países direto na sua conta. USD, EUR, GBP, CAD e mais. Cartão sem IOF, câmbio comercial, suporte humano. Pra PF e PJ.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
