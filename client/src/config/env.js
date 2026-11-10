// Environment flags.
//
// Demo mode (fake sign-in + sample data) must NEVER be reachable in a
// production build. `import.meta.env.DEV` is replaced by Vite with a literal
// `true`/`false` at build time, so every `DEMO_AVAILABLE && …` branch becomes
// `false && …` in the production bundle and is removed by Rollup — the demo
// code and the sample dataset do not ship to production at all.
//
//   npm run dev     → DEV = true  → demo enabled
//   npm run build   → DEV = false → demo disabled, code stripped
//
// There is deliberately no runtime override: production can never turn demo on.

export const IS_PRODUCTION = !import.meta.env.DEV;

/** Demo sign-in + sample data. Dev builds only. */
export const DEMO_AVAILABLE = import.meta.env.DEV;

/**
 * Older builds let visitors sign in with a fake `demo-token-*` session. Those
 * tokens may still be sitting in localStorage on real devices, so a production
 * boot must discard them instead of treating them as a real login.
 */
export const purgeLegacyDemoSession = () => {
  if (DEMO_AVAILABLE || typeof window === 'undefined') return false;
  try {
    const token = window.localStorage.getItem('token');
    if (token && token.startsWith('demo-token')) {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
      return true;
    }
  } catch {
    // storage unavailable (private mode) — nothing to purge
  }
  return false;
};

export default { IS_PRODUCTION, DEMO_AVAILABLE, purgeLegacyDemoSession };
