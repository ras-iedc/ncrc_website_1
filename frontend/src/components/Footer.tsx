import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink-900 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="NCRC" width={48} height={48} className="rounded-full" />
              <div>
                <h3 className="font-display font-bold text-lg">North Calcutta Rifle Club</h3>
                <p className="text-xs text-ink-500 font-medium">Est. 1948</p>
              </div>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">
              One of the oldest rifle shooting clubs in Kolkata, located at the entrance of Belgachia Road.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Shooting Ranges</h4>
            <ul className="space-y-2 text-sm text-ink-600">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent inline-block"></span>
                10m — Air Rifle
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent inline-block"></span>
                25m — Pistol
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent inline-block"></span>
                50m — Long Range
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/posts" className="text-ink-600 hover:text-accent transition-colors">News & Events</Link></li>
              <li><Link href="/shop" className="text-ink-600 hover:text-accent transition-colors">Pro Shop</Link></li>
              <li><Link href="/register" className="text-ink-600 hover:text-accent transition-colors">Become a Member</Link></li>
              <li><Link href="/login" className="text-ink-600 hover:text-accent transition-colors">Member Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t-2 border-ink-200 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-ink-500">&copy; {new Date().getFullYear()} North Calcutta Rifle Club. All rights reserved.</p>
          <p className="text-xs text-ink-400">Belgachia Road, Kolkata</p>
        </div>
      </div>
    </footer>
  );
}
