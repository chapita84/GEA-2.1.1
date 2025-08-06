import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext'; // <-- IMPORTAR


export const metadata: Metadata = {
  title: 'GEA: Acciones por una Tierra Verde',
  description:
    'El ecosistema digital que cataliza la transición hacia un estilo de vida sostenible.',
  icons: {
    icon: '/logoBig.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
       <body className="font-body antialiased">
        <AuthProvider> {/* <-- ENVOLVER */}
          {children}
          <Toaster />
        </AuthProvider> {/* <-- ENVOLVER */}
      </body>
    </html>
  );
}
