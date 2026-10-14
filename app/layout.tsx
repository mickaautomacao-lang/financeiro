import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinPulse - Controle Financeiro Pessoal Automatizado',
  description:
    'Sistema inteligente de controle financeiro com rastreamento de centavos, planejado x realizado e automações n8n/Telegram.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-background text-graphite-100 antialiased selection:bg-neon selection:text-black">
        {children}
      </body>
    </html>
  );
}

