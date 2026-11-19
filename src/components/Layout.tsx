import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';

export function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600/20 font-display text-sm font-bold text-accent-300">
              R
            </span>
            <span className="font-display text-lg font-bold tracking-[0.2em] text-white">
              REACHMC
            </span>
          </Link>
          <span className="hidden rounded-full border border-white/10 bg-ink-800 px-3 py-1 font-mono text-xs text-zinc-400 sm:block">
            ReachMc.fun
          </span>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.06] pb-24 pt-8 sm:pb-8">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="font-display text-sm font-semibold tracking-widest text-white">
            REACHMC
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Survival + Economy · Owned by Tenzi · ReachMc.fun
          </p>
          <p className="mt-3 text-[11px] text-zinc-600">
            Not affiliated with Mojang Studios or Microsoft.
          </p>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
