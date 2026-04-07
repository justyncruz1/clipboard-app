import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-medium tracking-widest uppercase border border-zinc-700 rounded-full text-zinc-400">
          <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          Now in Development
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
          <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">Clip</span>
          <span className="bg-gradient-to-b from-red-500 to-red-700 bg-clip-text text-transparent">Board</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed">
          The booking and business platform built for barbershops. No forced accounts. No hidden fees. Just sharp software for sharp shops.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/book/the-spot"
            className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all text-sm uppercase tracking-wider"
          >
            See Booking Demo
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 border border-zinc-700 hover:border-zinc-500 text-white font-semibold rounded-full transition-all text-sm uppercase tracking-wider"
          >
            See Dashboard Demo
          </Link>
        </div>
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full">
          {[
            { stat: "3 taps", label: "To book. No account needed." },
            { stat: "$29/mo", label: "Flat rate. Everything included." },
            { stat: "99.9%", label: "Uptime. No crashes at peak." },
          ].map((item) => (
            <div key={item.stat} className="text-center">
              <div className="text-2xl font-bold text-white">{item.stat}</div>
              <div className="text-sm text-zinc-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
