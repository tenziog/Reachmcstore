import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Clock,
  PartyPopper,
  ExternalLink,
  Link2,
  Hash,
  User,
  FileText,
  Loader2,
} from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { formatInr } from '@/context/CartContext';
import {
  loadOrder,
  orderAsText,
  orderPath,
  orderShareUrl,
  type Order,
} from '@/lib/orders';
import { DISCORD_INVITE } from '@/config';

const CHECKOUT_STEPS = [
  'Join our official ReachMC Discord server.',
  'Open a Buy Ticket.',
  'Copy your generated order information.',
  'Paste it inside your Buy Ticket.',
  'Our staff will verify your order and assist you.',
];

function OrderView({ order }: { order: Order }) {
  const shareUrl = orderShareUrl(order.orderId);
  const orderText = orderAsText(order);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10">
          <PartyPopper className="h-8 w-8 text-emerald-400" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-wide text-white sm:text-4xl">
          THANK YOU FOR YOUR ORDER!
        </h1>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
          <Clock className="h-4 w-4" /> Pending staff verification
        </div>
      </div>

      <div className="card-surface mt-10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Order ID
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-accent-300">
              {order.orderId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Date
            </p>
            <p className="mt-1 text-sm text-zinc-300">
              {new Date(order.createdAtIso).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 shrink-0 text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Minecraft Username</p>
              <p className="text-sm font-semibold text-white">
                {order.minecraftUsername}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 shrink-0 text-zinc-500" />
            <div>
              <p className="text-xs text-zinc-500">Discord Username</p>
              <p className="text-sm font-semibold text-white">
                {order.discordUsername}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
            Products
          </p>
          <ul className="space-y-2.5">
            {order.lines.map((line) => (
              <li
                key={line.productId}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="text-zinc-200">
                  {line.name} <span className="text-zinc-500">x{line.quantity}</span>
                </span>
                <span className="text-zinc-400">
                  <span className="font-mono text-xs">
                    {formatInr(line.unitPriceInr)} each
                  </span>{' '}
                  <span className="font-semibold text-white">
                    {formatInr(line.lineTotalInr)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
            <span className="font-display text-lg font-semibold text-white">
              Total
            </span>
            <span className="font-display text-2xl font-bold text-accent-300">
              {formatInr(order.totalInr)}
            </span>
          </div>
        </div>
      </div>

      <div className="card-surface mt-6 p-6">
        <h2 className="mb-5 font-display text-lg font-semibold text-white">
          Next steps
        </h2>
        <ol className="space-y-3">
          {CHECKOUT_STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500/15 font-mono text-xs font-semibold text-accent-300">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm text-zinc-300">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <CopyButton text={orderText} label="Copy Order Information" className="btn-accent px-5 py-3 text-sm" />
          {DISCORD_INVITE ? (
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-5 py-3 text-sm"
            >
              <ExternalLink className="h-4 w-4" /> Open Discord
            </a>
          ) : (
            <span
              title="Discord invite will be configured soon"
              className="btn-ghost cursor-not-allowed px-5 py-3 text-sm opacity-50"
            >
              <ExternalLink className="h-4 w-4" /> Open Discord (coming soon)
            </span>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-white/[0.06] bg-ink-800 p-4">
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
            <Link2 className="h-3.5 w-3.5" /> Shareable order summary link
          </p>
          <p className="break-all font-mono text-xs text-zinc-400">{shareUrl}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={shareUrl} label="Copy link" className="btn-ghost px-4 py-2 text-xs" />
            <Link
              to={orderPath(order.orderId)}
              className="btn-ghost px-4 py-2 text-xs"
            >
              Open summary page
            </Link>
          </div>
        </div>

        <details className="mt-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
            <FileText className="h-4 w-4" /> Preview order information
          </summary>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06] bg-ink-900 p-4 font-mono text-xs leading-relaxed text-zinc-300">
            {orderText}
          </pre>
        </details>
      </div>

      <div className="mt-8 text-center">
        <Link to="/store" className="btn-ghost px-6 py-3 text-sm">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export function OrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    document.title = `Order ${orderId ?? ''} — REACHMC`;
    let active = true;

    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return () => {
        document.title = 'REACHMC';
      };
    }

    setLoading(true);
    setLoadError(false);
    loadOrder(orderId)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch(() => {
        if (active) {
          setOrder(null);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      document.title = 'REACHMC';
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (order) return <OrderView order={order} />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-white">
        {loadError ? 'Order could not be loaded' : 'Order not found'}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {loadError
          ? 'Please check your connection and open the order link again.'
          : `No order with ID ${orderId ?? 'provided'} exists.`}
      </p>
      <Link to="/" className="btn-accent mt-6 px-6 py-3 text-sm">
        Back to Home
      </Link>
    </div>
  );
}
