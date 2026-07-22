import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-800 border-t border-neutral-100 dark:border-neutral-700 mt-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Pout<span className="text-primary-600">.</span>Scent
            </Link>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Parfumerie et cosmetique de qualite, livree partout au Benin.
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
                Cotonou, Benin
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
