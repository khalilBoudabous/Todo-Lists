import Link from 'next/link';
import Logo from '@/components/Logo';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-background overflow-hidden">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Logo size={48} textColor="text-foreground" />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-xl text-muted mb-8">Page not found</p>
        <Link href="/" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg inline-flex items-center gap-2">
          <Home size={18} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
