import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-white border-b-2 border-ink-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block neo-badge bg-cream-100 text-ink-700 mb-6">Est. 1948</div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink-900 leading-[1.05] mb-6">
                North Calcutta<br />Rifle Club
              </h1>
              <p className="text-lg text-ink-600 max-w-xl leading-relaxed mb-8">
                One of the oldest rifle shooting clubs in Kolkata. Three world-class shooting ranges, 
                monthly competitions, and expert coaching for all skill levels.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href="/register" className="neo-btn neo-btn-primary text-base">
                  Become a Member
                </Link>
                <Link href="/posts" className="neo-btn neo-btn-secondary text-base">
                  View Events
                </Link>
              </div>
            </div>
            <div className="shrink-0">
              <div className="neo-card p-6 md:p-8">
                <Image src="/logo.png" alt="North Calcutta Rifle Club" width={240} height={240} className="mx-auto" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ranges */}
      <section className="bg-cream-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">Our Shooting Ranges</h2>
          <p className="text-center text-ink-500 mb-12 max-w-2xl mx-auto">
            World-class facilities equipped for precision shooting across all distances.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <RangeCard distance="10m" type="Air Rifle" desc="Precision air rifle shooting in a controlled indoor environment. Perfect for beginners and competitive shooters." />
            <RangeCard distance="25m" type="Pistol" desc="Dedicated pistol range for rapid fire and precision pistol disciplines. Fully equipped with modern target systems." />
            <RangeCard distance="50m" type="Long Range" desc="Full-bore rifle shooting range for experienced marksmen. Ideal for competitive long-range shooting practice." />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white border-y-2 border-ink-900 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="neo-badge bg-accent-light text-accent mb-4">About the Club</div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                A Legacy of Excellence Since 1948
              </h2>
              <p className="text-ink-600 leading-relaxed mb-4">
                Founded in 1948, North Calcutta Rifle Club is one of the oldest rifle shooting clubs 
                in the city. Located at the entrance of Belgachia Road, the club has been a cornerstone 
                of the shooting sports community in Kolkata for over seven decades.
              </p>
              <p className="text-ink-600 leading-relaxed mb-6">
                The club holds competitions almost every month and the management is equipped with 
                experts who provide the best knowledge for all three kinds of shooting — air rifle, 
                pistol, and long range.
              </p>
              <Link href="/register" className="neo-btn neo-btn-primary">
                Join the Club →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard value="75+" label="Years of Legacy" />
              <StatCard value="3" label="Shooting Ranges" />
              <StatCard value="12+" label="Monthly Events" />
              <StatCard value="500+" label="Active Members" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-900 text-white py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Start Shooting?</h2>
          <p className="text-ink-300 text-lg mb-8">
            Join North Calcutta Rifle Club today and become part of a proud tradition of marksmanship.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/register" className="neo-btn bg-accent text-white border-white shadow-[3px_3px_0_white] hover:shadow-[1px_1px_0_white] text-base">
              Register Now
            </Link>
            <Link href="/login" className="neo-btn bg-transparent text-white border-white shadow-[3px_3px_0_white] hover:shadow-[1px_1px_0_white] text-base">
              Member Login
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function RangeCard({ distance, type, desc }: { distance: string; type: string; desc: string }) {
  return (
    <div className="neo-card p-6">
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-display text-4xl font-bold text-accent">{distance}</span>
        <span className="font-display text-sm font-semibold text-ink-500 uppercase tracking-wider">{type}</span>
      </div>
      <p className="text-sm text-ink-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="neo-card p-5 text-center">
      <p className="font-display text-3xl font-bold text-accent">{value}</p>
      <p className="text-sm text-ink-600 font-medium mt-1">{label}</p>
    </div>
  );
}
