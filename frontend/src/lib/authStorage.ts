// ============================================================
// AUTH STORAGE — Gestion centralisée du stockage des tokens
// ============================================================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  REMEMBER_ME: 'remember_me',
} as const;

/**
 * Détermine le stockage à utiliser selon le choix "Se souvenir de moi"
 */
function getStorage(rememberMe?: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

/**
 * Récupère le choix "Se souvenir de moi" (défaut: true)
 */
export function getRememberMe(): boolean {
  const value = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
  return value === null ? true : value === 'true';
}

/**
 * Stocke les tokens JWT
 */
export function setTokens(
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean
): void {
  const storage = getStorage(rememberMe);
  storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

  // Sauvegarder le choix dans localStorage (toujours persistant)
  localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, String(rememberMe));
}

/**
 * Récupère les tokens (cherche dans les deux stockages)
 */
export function getTokens(): { access: string | null; refresh: string | null } {
  // Chercher d'abord dans localStorage, puis sessionStorage
  const access =
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const refresh =
    localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  return { access, refresh };
}

/**
 * Récupère le token d'accès uniquement
 */
export function getAccessToken(): string | null {
  return getTokens().access;
}

/**
 * Supprime les tokens des deux stockages
 */
export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Vérifie si l'utilisateur est connecté (token présent)
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}