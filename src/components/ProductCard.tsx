import { Crown, KeyRound, Coins } from 'lucide-react';
import type { Product } from '@/config';
import { useCart } from '@/context/CartContext';
import { formatInr } from '@/context/CartContext';

const CATEGORY_ICONS = {
  ranks: Crown,
  crates: KeyRound,
  economy: Coins,
} as const;

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart();
  const Icon = CATEGORY_ICONS[product.category];

  return (
    <div
      className={`card-surface group relative flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/30 hover:shadow-[0_8px_40px_-8px_rgba(139,92,246,0.25)] ${
        product.featured ? 'ring-1 ring-accent-500/40' : ''
      }`}
    >
      {product.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-600 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
          Most Popular
        </span>
      )}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold tracking-wide text-white">
            {product.name}
          </h3>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            {product.category === 'ranks'
              ? 'Rank'
              : product.category === 'crates'
                ? 'Crate Key'
                : 'In-Game Money'}
          </p>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-zinc-400">
        {product.description}
      </p>

      <ul className="mb-6 flex-1 space-y-2">
        {product.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm text-zinc-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
            {perk}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <span className="font-display text-2xl font-bold text-white">
          {formatInr(product.priceInr)}
        </span>
        <button
          type="button"
          onClick={() => add(product.id)}
          className="btn-accent px-5 py-2.5 text-sm"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

