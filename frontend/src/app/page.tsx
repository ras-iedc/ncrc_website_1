import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          National Capital Rifle Club
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Welcome to the official membership portal. Manage your membership, payments, and stay updated with club activities.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-red-600 px-6 py-3 text-white font-medium hover:bg-red-700 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
