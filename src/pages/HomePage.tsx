import { Link } from 'react-router-dom';
import ownerPfp from '@/assets/images/file_00000000068082118f4915c47cdd8b7c.png';
import {
  Shield,
  Swords,
  Coins,
  HandCoins,
  Sprout,
  TrendingUp,
  Users,
  Copy,
  Check,
  Loader2,
  CopyPlus,
  Crown,
  ArrowUpRight,
} from 'lucide-react';
import { useState } from 'react';
import { SERVER_IP, SITE_NAME, OWNER, TAGLINE } from '@/config';
import { useServerStatus } from '@/hooks/useServerStatus';
import { MC_STATUS_API_URL } from '@/config';
import { ProductCard } from '@/components/ProductCard';
import { PRODUCTS } from '@/config';

const FEATURES = [
  {
    icon: Swords,
    title: 'Survival',
    desc: 'Pure survival gameplay with a fair, curated world built for long-term players.',
  },
  {
    icon: Coins,
    title: 'Player Economy',
    desc: 'A real player-driven economy. Earn, spend and invest — no admin shops dumping items.',
  },
  {
    icon: HandCoins,
    title: 'Money Trading',
    desc: 'Trade balances with other players, pay for services, and hire builders.',
  },
  {
    icon: Sprout,
    title: 'Farming',
    desc: 'Grow crops, raise animals and build farms that feed the market.',
  },
  {
    icon: TrendingUp,
    title: 'Player Progression',
    desc: 'Rank up, unlock perks and grow your legacy through the server.',
  },
  {
    icon: Users,
    title: 'Community',
    desc: 'An active, friendly community backed by a responsive staff team.',
  },
];

function StatusBadge() {
  const status = useServerStatus(MC_STATUS_API_URL);
  if (status.loading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-800 px-4 py-1.5 text-sm text-zinc-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking status...
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${
        status.online
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          : 'border-red-500/30 bg-red-500/10 text-red-400'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            status.online ? 'bg-emerald-400 animate-pulse-dot' : 'bg-red-400'
          }`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            status.online ? 'bg-emerald-400' : 'bg-red-400'
          }`}
        />
      </span>
      {status.online ? 'ONLINE' : 'OFFLINE'}
      {status.online && status.players && (
        <span className="font-mono text-xs font-normal text-zinc-400">
          {status.players.current}/{status.players.max} playing
        </span>
      )}
    </span>
  );
}

function OwnerCard() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-8">
      <div className="owner-card group relative overflow-hidden rounded-3xl border border-accent-500/20 bg-ink-850 p-6 sm:p-8">
        <div className="owner-card-glow pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl transition duration-700 group-hover:bg-accent-400/30" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative shrink-0">
            <div className="owner-ring absolute -inset-2 rounded-[28px] border border-accent-400/40" />
            <img
              src={ownerPfp}
              alt="Tenzi, owner of ReachMC"
              className="relative h-28 w-28 rounded-2xl object-cover shadow-[0_12px_40px_-12px_rgba(139,92,246,0.7)] sm:h-32 sm:w-32"
            />
            <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-4 border-ink-850 bg-accent-600 text-white">
              <Crown className="h-4 w-4" />
            </span>
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">
              Meet the owner
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              Tenzi
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
              Building a fair, ambitious Survival + Economy network where every
              player can create something worth remembering.
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-400 sm:flex">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-400" />
            Network owner
            <ArrowUpRight className="h-3.5 w-3.5 text-accent-400" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const [copied, setCopied] = useState(false);

  async function copyIp() {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — IP stays visible on screen
    }
  }

  return (
    <section className="hero-section relative overflow-hidden">
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="hero-orb hero-orb-left pointer-events-none absolute" />
      <div className="hero-orb hero-orb-right pointer-events-none absolute" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,0.25), transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:pt-24">
        <div className="mb-6 inline-flex animate-float items-center gap-3 rounded-2xl border border-accent-500/20 bg-ink-850/80 px-6 py-4 shadow-[0_0_60px_-15px_rgba(139,92,246,0.4)] backdrop-blur transition-shadow duration-500 hover:shadow-[0_0_80px_-12px_rgba(139,92,246,0.7)]">
          <Shield className="h-9 w-9 text-accent-400" />
          <div className="text-left">
            <div className="font-display text-2xl font-bold leading-none tracking-widest text-white">
              REACHMC
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              Survival · Economy
            </div>
          </div>
        </div>

        <h1 className="animate-fade-up font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          WELCOME TO {SITE_NAME}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl animate-fade-up font-display text-base font-medium tracking-[0.15em] text-accent-300 sm:text-xl">
          {TAGLINE}
        </p>

        <div className="mt-8 flex animate-fade-up flex-col items-center gap-4">
          <StatusBadge />
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={copyIp}
              className="group flex items-center gap-3 rounded-xl border border-white/10 bg-ink-850 px-5 py-3 font-mono text-lg font-semibold text-white transition-all hover:border-accent-500/40 hover:bg-ink-800"
            >
              {copied ? (
                <Check className="h-5 w-5 text-emerald-400" />
              ) : (
                <Copy className="h-5 w-5 text-accent-400" />
              )}
              {SERVER_IP}
              <span className="rounded-md bg-accent-500/10 px-2 py-0.5 text-xs font-normal text-accent-300">
                {copied ? 'Copied!' : 'Copy IP'}
              </span>
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            Owned by <span className="font-semibold text-zinc-300">{OWNER}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const featured = PRODUCTS.filter((p) => p.category === 'ranks').slice(0, 3);

  return (
    <div>
      <Hero />

      <OwnerCard />

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="ready-card flex flex-col items-center gap-3 rounded-2xl border border-accent-500/20 bg-gradient-to-b from-accent-500/10 to-transparent p-6 text-center">
          <CopyPlus className="h-6 w-6 text-accent-400" />
          <h2 className="font-display text-xl font-bold text-white">
            Ready to play?
          </h2>
          <p className="max-w-md text-sm text-zinc-400">
            Add the server to Minecraft with the IP above, join our Discord, and
            start building your legacy today.
          </p>
          <Link to="/store" className="btn-accent mt-2 px-6 py-3 text-sm">
            Browse the Store
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-2 text-center font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
          SERVER FEATURES
        </h2>
        <p className="mb-10 text-center text-sm text-zinc-500">
          Strictly Survival + Economy. Nothing else.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="card-surface feature-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 font-display text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
              FEATURED RANKS
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Stand out on the server with a premium rank.
            </p>
          </div>
          <Link
            to="/store/ranks"
            className="hidden text-sm font-medium text-accent-400 hover:text-accent-300 sm:block"
          >
            View all ranks →
          </Link>
        </div>
        <div className="grid gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
