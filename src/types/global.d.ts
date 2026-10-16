/**
 * Global window typings shared across site scripts.
 * `sckToast` is installed by src/components/Toaster.astro at runtime.
 */
declare global {
  interface Window {
    sckToast: (t: { title: string; body?: string; kind?: 'ok' | 'warn' }) => void;
  }
}

export {};
