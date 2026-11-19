import { Navigate, useParams } from 'react-router-dom';
import { PRODUCTS, CATEGORY_LABELS, type Category } from '@/config';
import { ProductCard } from '@/components/ProductCard';

const VALID: Category[] = ['ranks', 'crates', 'economy'];

export function StorePage() {
  const { category } = useParams<{ category: string }>();

  const activeCategory =
    category && VALID.includes(category as Category) ? (category as Category) : null;

  const products = activeCategory
    ? PRODUCTS.filter((p) => p.category === activeCategory)
    : PRODUCTS;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-3xl font-bold tracking-wide text-white sm:text-4xl">
        {activeCategory ? CATEGORY_LABELS[activeCategory].toUpperCase() : 'STORE'}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {activeCategory
          ? activeCategory === 'ranks'
            ? 'Premium ranks with kits, /echeast and extra homes.'
            : activeCategory === 'crates'
              ? 'Crate keys redeemed in-game at /warp crates.'
              : 'In-game money delivered directly to your balance.'
          : 'Ranks, crate keys and in-game money — all delivered in-game after staff verification.'}
      </p>

      <div className="mt-10 grid gap-5 pt-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <div
            key={p.id}
            className="animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {activeCategory === 'ranks' && (
        <p className="mt-10 rounded-xl border border-white/[0.06] bg-ink-850 p-4 text-center text-xs text-zinc-500">
          Higher ranks include all lower-rank perks. Ranks are permanent and tied
          to your Minecraft account.
        </p>
      )}
    </div>
  );
}

export function StoreRedirect() {
  return <Navigate to="/store" replace />;
}
