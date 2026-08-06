import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo List App',
  description: 'Manage your tasks efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col h-screen overflow-hidden`}>
        <AuthProvider>
          <div className="flex-1 flex flex-col overflow-hidden">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
