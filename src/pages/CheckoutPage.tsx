import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Hash,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatInr } from '@/context/CartContext';
import { buildOrder, createOrder, generateOrderId } from '@/lib/orders';

export function CheckoutPage() {
  const { items, detailed, subtotal, clear, isReady } = useCart();
  const navigate = useNavigate();
  const [minecraft, setMinecraft] = useState('');
  const [discord, setDiscord] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-white">
          Nothing to check out
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Your cart is empty. Add products first.
        </p>
        <Link to="/store" className="btn-accent mt-6 px-6 py-3 text-sm">
          Go to Store
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mc = minecraft.trim();
    const dc = discord.trim();
    if (mc.length < 3 || mc.length > 16 || !/^[A-Za-z0-9_]+$/.test(mc)) {
      setError('Enter a valid Minecraft username (3-16 letters, numbers, underscores).');
      return;
    }
    if (dc.length < 2 || dc.length > 32) {
      setError('Enter a valid Discord username.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const order = buildOrder(generateOrderId(), mc, dc, items);
      if (!order) {
        setError('Your cart could not be prepared. Please return to the cart and try again.');
        setSubmitting(false);
        return;
      }
      await createOrder(order);
      clear();
      navigate(`/order/${encodeURIComponent(order.orderId)}`, { replace: true });
    } catch {
      setError('We could not create your order right now. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to cart
      </Link>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-wide text-white">
        CHECKOUT
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        No payment gateway — your order is verified manually by staff on Discord.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="card-surface p-6">
          <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <User className="h-5 w-5 text-accent-400" /> Step 1 — Your details
          </h2>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Minecraft Username
            </span>
            <input
              type="text"
              value={minecraft}
              onChange={(e) => setMinecraft(e.target.value)}
              placeholder="e.g. Tenzi123"
              maxLength={16}
              required
              className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
            />
          </label>

          <label className="mb-2 block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-300">
              Discord Username
            </span>
            <input
              type="text"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder="e.g. tenzi"
              maxLength={32}
              required
              className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
            />
          </label>

          {error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-accent mt-4 w-full py-3.5 text-sm"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Step 2 — Generate Order <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            We never ask for your Minecraft or Discord password. Your order stays
            pending until staff verify it manually.
          </p>
        </form>

        <aside className="card-surface h-fit p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Hash className="h-5 w-5 text-accent-400" /> Order summary
          </h2>
          <ul className="space-y-3">
            {detailed.map(({ product, quantity, lineTotal }) => (
              <li key={product.id} className="flex justify-between text-sm">
                <span className="text-zinc-300">
                  {product.name} <span className="text-zinc-500">x{quantity}</span>
                </span>
                <span className="font-mono text-zinc-400">
                  {formatInr(lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-white/[0.06] pt-4">
            <span className="font-display font-semibold text-white">Total</span>
            <span className="font-display text-xl font-bold text-accent-300">
              {formatInr(subtotal)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
