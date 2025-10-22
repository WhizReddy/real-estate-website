"use client";

import Link from "next/link";

export default function ResponsiveDemoPage() {
  return (
  <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <nav className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-semibold">
              RE
            </span>
            <span className="font-semibold">Responsive Demo</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/properties" className="hover:text-slate-900">Properties</Link>
            <Link href="/admin/dashboard" className="hover:text-slate-900">Dashboard</Link>
          </div>
          <div className="md:hidden">
            <button className="rounded-lg border px-3 py-1.5 text-sm">Menu</button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16 grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="font-bold leading-tight" style={{ fontSize: "clamp(1.75rem, 1.2rem + 2.5vw, 3rem)" }}>
            Build once, look great everywhere
          </h1>
          <p className="mt-4 text-slate-600 max-w-prose">
            This page demonstrates a modern, mobile-first responsive layout using Tailwind. Resize
            the viewport to see the navbar, hero, cards, and sidebar adapt smoothly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm">
              Go to Home
            </Link>
            <Link href="/properties" className="px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 text-sm">
              Browse Properties
            </Link>
          </div>
        </div>
        <div className="aspect-video rounded-xl bg-white shadow-sm border border-slate-200 grid place-items-center">
          <span className="text-slate-500 text-sm">Responsive media area</span>
        </div>
      </section>

      {/* Content: Sidebar + Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar */}
          <aside className="order-2 lg:order-1">
            <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Filters</h3>
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300"/> Near center</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300"/> With parking</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="rounded border-slate-300"/> New build</label>
              </div>
            </div>
          </aside>

          {/* Cards Grid */}
          <div className="order-1 lg:order-2">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold" style={{ fontSize: "clamp(1.125rem, 0.9rem + 0.8vw, 1.5rem)" }}>Featured Listings</h2>
              <select className="text-sm rounded-md border border-slate-300 px-2 py-1 bg-white">
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 @container">
              {Array.from({ length: 9 }).map((_, i) => (
                <article key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="aspect-video bg-slate-100 grid place-items-center">
                    <span className="text-slate-400 text-xs">image</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium leading-tight @container" style={{ fontSize: "clamp(1rem, 0.9rem + 0.3cqi, 1.125rem)" }}>
                      Cozy Apartment in Tirana #{i + 1}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                      Close to amenities, modern finishes, and great natural light.
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-blue-600 font-semibold">€{(120000 + i * 5000).toLocaleString()}</span>
                      <button className="text-sm px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50">View</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-600">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Company</h4>
            <ul className="space-y-1">
              <li><Link href="#">About</Link></li>
              <li><Link href="#">Team</Link></li>
              <li><Link href="#">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Support</h4>
            <ul className="space-y-1">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Contact</Link></li>
              <li><Link href="#">Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Legal</h4>
            <ul className="space-y-1">
              <li><Link href="#">Privacy</Link></li>
              <li><Link href="#">Terms</Link></li>
              <li><Link href="#">Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Newsletter</h4>
            <div className="flex gap-2">
              <input className="flex-1 rounded-md border border-slate-300 px-3 py-2" placeholder="Your email" />
              <button className="rounded-md bg-blue-600 text-white px-4">Join</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
