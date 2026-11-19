import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart, formatInr } from '@/context/CartContext';

export function CartPage() {
  const { detailed, subtotal, setQuantity, remove, isReady } = useCart();

  if (!isReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  if (detailed.length === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-800">
          <ShoppingCart className="h-9 w-9 text-zinc-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          Browse the store and add ranks, crate keys or in-game money to get
          started.
        </p>
        <Link to="/store" className="btn-accent mt-6 px-6 py-3 text-sm">
          Go to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-wide text-white">
        YOUR CART
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Review your items before checkout.
      </p>

      <div className="mt-8 space-y-3">
        {detailed.map(({ product, quantity, lineTotal }) => (
          <div
            key={product.id}
            className="card-surface flex flex-wrap items-center gap-4 p-4 sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-semibold text-white">
                {product.name}
              </h3>
              <p className="text-xs text-zinc-500">
                {formatInr(product.priceInr)} each
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-ink-800 p-1">
              <button
                type="button"
                aria-label={`Decrease ${product.name} quantity`}
                onClick={() => setQuantity(product.id, quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-mono text-sm font-semibold text-white">
                {quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase ${product.name} quantity`}
                onClick={() => setQuantity(product.id, quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <span className="w-20 text-right font-display font-semibold text-white">
              {formatInr(lineTotal)}
            </span>

            <button
              type="button"
              aria-label={`Remove ${product.name}`}
              onClick={() => remove(product.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="card-surface mt-8 p-6">
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>Subtotal</span>
          <span className="font-mono">{formatInr(subtotal)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <span className="font-display text-lg font-semibold text-white">
            Total
          </span>
          <span className="font-display text-2xl font-bold text-accent-300">
            {formatInr(subtotal)}
          </span>
        </div>
        <Link to="/checkout" className="btn-accent mt-6 w-full py-3.5 text-sm">
          Proceed to Checkout
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-center text-xs text-zinc-500">
          No automatic payment — orders are completed manually via Discord.
        </p>
      </div>
    </div>
  );
}
