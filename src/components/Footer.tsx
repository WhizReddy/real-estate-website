import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🏠</div>
              <h3 className="text-xl font-bold text-red-400">
                Pasuritë e Tiranës
              </h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Partneri juaj i besuar për të gjetur shtëpinë perfekte në Tiranë. 
              Ofrojmë shërbime profesionale për blerje, shitje dhe qira pasurie.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Lidhje të Shpejta</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  Kryesore
                </Link>
              </li>
              <li>
                <Link
                  href="/#properties"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  Pasuritë
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  Rreth Nesh
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  Kontakti
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Shërbimet</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">Blerje Pasurie</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Shitje Pasurie</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Qira Pasurie</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Konsulencë Pasurie</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Vlerësim Pasurie</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Informacione Kontakti</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>Rruga "Dëshmorët e Kombit"</p>
                  <p>Tiranë, Shqipëri</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-400 flex-shrink-0" />
                <a
                  href="tel:+35569123456"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  +355 69 123 4567
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-400 flex-shrink-0" />
                <a
                  href="mailto:info@pasuritëtiranës.al"
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm"
                >
                  info@pasuritëtiranës.al
                </a>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>Hën-Pre: 9:00-18:00</p>
                  <p>Sht-Dje: 10:00-16:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Pasuritë e Tiranës. Të gjitha të drejtat e rezervuara.
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                Politika e Privatësisë
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                Kushtet e Përdorimit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}