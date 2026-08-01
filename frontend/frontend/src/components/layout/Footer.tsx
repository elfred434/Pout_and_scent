import { Link } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.svg';

export function Footer() {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 text-neutral-900 dark:text-white">
              <img src={logoIcon} alt="" className="h-10 w-10" />
              <span className="text-sm font-semibold tracking-[0.12em]">POUT <span className="text-primary-600">&amp;</span> SCENT</span>
            </Link>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Parfumerie et cosmétique de qualité, livrée partout au Bénin.
            </p>
          </div>

          {/* Boutique */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Boutique</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/catalogue" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Collection
                </Link>
              </li>
              <li>
                <Link to="/promotions" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Promotions
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/mentions-legales" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Mentions legales
                </Link>
              </li>
              <li>
                <Link to="/cgv" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  CGV
                </Link>
              </li>
              <li>
                <Link to="/politique-confidentialite" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Confidentialite
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="text-sm text-neutral-600 dark:text-neutral-400">
                contact@poutscent.bj
              </li>
              <li className="text-sm text-neutral-600 dark:text-neutral-400">
                +229 XX XX XX XX
              </li>
              <li className="text-sm text-neutral-600 dark:text-neutral-400">
                Cotonou, Bénin
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} Pout & Scent. Tous droits reserves.
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Conforme au Code du numerique beninois
          </p>
        </div>
      </div>
    </footer>
  );
}
