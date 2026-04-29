import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VagaCerta — Vagas home office de verdade no seu WhatsApp',
  description: '12 mil pessoas já trocaram o escritório pelo sofá. Cadastre seu perfil e receba vagas home office sob medida no seu WhatsApp e e-mail. Entrevista online em menos de 7 dias.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
