import type { Metadata } from 'next';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Mail, Phone, MapPin, Clock, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Kontakti — Real Estate Tiranë',
    description: 'Na kontaktoni për çdo pyetje mbi pasuritë e patundshme në Tiranë. Ekipi ynë është gati t\'ju ndihmojë.',
};

export default function ContactPage() {
    return (
        <Layout variant="homepage">
            {/* Header */}
            <section className="bg-[var(--background)] border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link
                        href="/"
                        className="inline-flex items-center text-[var(--primary)] hover:text-[var(--primary-dark)] mb-4 transition-colors duration-200 text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kthehu në Kryesore
                    </Link>
                    <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">Na Kontaktoni</h1>
                    <p className="text-[var(--foreground)] opacity-80 text-lg">
                        Jemi këtu për t&apos;ju ndihmuar të gjeni pasurinë e ëndrrave tuaja.
                    </p>
                </div>
            </section>

            <div className="bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Contact Form */}
                        <div className="card p-8">
                            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Dërgo një Mesazh</h2>
                            <p className="text-[var(--foreground)] opacity-80 mb-8">
                                Plotësoni formularin dhe do t&apos;ju kontaktojmë brenda 24 orësh.
                            </p>

                            <form className="space-y-5" action="/api/inquiries" method="POST">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Emri i Plotë *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="Emri dhe mbiemri juaj"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Telefoni
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            placeholder="+355 69 123 4567"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        placeholder="emri.juaj@email.com"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Subjekti
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                    >
                                        <option value="">Zgjidhni një temë...</option>
                                        <option value="buy">Dua të blej pasuri</option>
                                        <option value="rent">Dua të qiroj pasuri</option>
                                        <option value="sell">Dua të shes pasuri</option>
                                        <option value="info">Informacion i përgjithshëm</option>
                                        <option value="other">Tjetër</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Mesazhi *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={5}
                                        placeholder="Shkruani mesazhin tuaj këtu..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
                                >
                                    Dërgo Mesazhin
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-6">
                            <div className="card p-8">
                                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Informacione Kontakti</h2>
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                                        <div className="p-3 bg-blue-600 rounded-xl flex-shrink-0">
                                            <MapPin className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Adresa</p>
                                            <p className="text-slate-600 text-sm">Rruga &quot;Dëshmorët e Kombit&quot;</p>
                                            <p className="text-slate-600 text-sm">Tiranë 1001, Shqipëri</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                                        <div className="p-3 bg-blue-600 rounded-xl flex-shrink-0">
                                            <Phone className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Telefoni</p>
                                            <a
                                                href="tel:+355691234567"
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                            >
                                                +355 69 123 4567
                                            </a>
                                            <p className="text-slate-400 text-xs mt-0.5">Disponibël 24/7</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                                        <div className="p-3 bg-blue-600 rounded-xl flex-shrink-0">
                                            <Mail className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Email</p>
                                            <a
                                                href="mailto:info@realestate-tirana.al"
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                            >
                                                info@realestate-tirana.al
                                            </a>
                                            <p className="text-slate-400 text-xs mt-0.5">Përgjigje brenda 1 ore</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50">
                                        <div className="p-3 bg-blue-600 rounded-xl flex-shrink-0">
                                            <Clock className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Orari i Punës</p>
                                            <p className="text-slate-600 text-sm">E Hënë – E Premte: 9:00 – 19:00</p>
                                            <p className="text-slate-600 text-sm">E Shtunë – E Diel: 10:00 – 17:00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-blue-600 rounded-2xl p-8 text-white">
                                <h3 className="text-xl font-bold mb-3">Shiko Pasuritë</h3>
                                <p className="text-blue-100 text-sm mb-6">
                                    Keni interes për blerje apo qira? Shfletoni koleksionin tonë të pasurive premium.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href="/#properties"
                                        className="flex-1 py-3 bg-white text-blue-700 rounded-xl font-bold text-sm text-center hover:bg-blue-50 transition-colors"
                                    >
                                        Shiko Shpalljet
                                    </Link>
                                    <Link
                                        href="/map"
                                        className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm text-center hover:bg-blue-400 transition-colors"
                                    >
                                        Harta Interaktive
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
