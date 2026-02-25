import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter, Building2, Award, Shield, Users } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer aria-label="Futeri i faqes" className="text-[var(--foreground)] bg-[var(--background)] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                Real Estate Tiranë
              </h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Partneri juaj i besuar për të gjetur shtëpinë perfekte në Tiranë.
              Ofrojmë shërbime profesionale për blerje, shitje dhe qira pasurie me teknologji moderne.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <Award className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs text-slate-500">Certifikuar</div>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs text-slate-500">I Sigurt</div>
              </div>
              <div className="text-center">
                <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xs text-slate-500">500+ Klientë</div>
              </div>
            </div>

            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                className="text-slate-400 hover:text-blue-600 transition-colors p-2 bg-slate-100 rounded-lg hover:bg-blue-50"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                className="text-gray-400 hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-lg hover:bg-blue-600/20"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                className="text-gray-400 hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-lg hover:bg-blue-600/20"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <div className="w-1 h-6 bg-white rounded-full mr-3"></div>
              Lidhje të Shpejta
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Kryesore
                </Link>
              </li>
              <li>
                <Link
                  href="/#properties"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Pasuritë
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Rreth Nesh
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  Kontakti
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <div className="w-1 h-6 bg-white rounded-full mr-3"></div>
              Shërbimet {currentYear}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                Blerje Pasurie Premium
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                Shitje me Teknologji AI
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                Qira Afatgjatë & Afatshkurtër
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                Konsulencë Investimi
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                Vlerësim Profesional
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <div className="w-1 h-6 bg-white rounded-full mr-3"></div>
              Kontakti {currentYear}
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-blue-600/10 transition-colors">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <p className="font-medium">Zyra Kryesore</p>
                  <p>Rruga "Dëshmorët e Kombit"</p>
                  <p>Tiranë 1001, Shqipëri</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-blue-600/10 transition-colors">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <a
                    href="tel:+355691234567"
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    +355 69 123 4567
                  </a>
                  <p className="text-xs text-gray-500">24/7 Mbështetje</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg hover:bg-blue-600/10 transition-colors">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <a
                    href="mailto:info@realestate-tirana.al"
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    info@realestate-tirana.al
                  </a>
                  <p className="text-xs text-gray-500">Përgjigje brenda 1 ore</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <p className="font-medium">Orari i Punës</p>
                  <p>Hën-Pre: 9:00-19:00</p>
                  <p>Sht-Dje: 10:00-17:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm flex items-center">
              <span>© {currentYear} Real Estate Tiranë.</span>
              <span className="mx-2">•</span>
              <span>Të gjitha të drejtat e rezervuara.</span>
              <span className="mx-2">•</span>
              <span className="text-blue-400">Powered by Modern Tech</span>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                Privatësia
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                Kushtet
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}