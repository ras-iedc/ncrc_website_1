import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <Image src="/logo.png" alt="NCRC" width={48} height={48} className="rounded-full" />
            <span className="font-display text-xl font-bold">NCRC</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
