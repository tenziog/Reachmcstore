import { NavLink } from 'react-router-dom';
import {
  Home,
  Store,
  Crown,
  KeyRound,
  Coins,
  ShoppingCart,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { DISCORD_INVITE } from '@/config';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/store', label: 'Store', icon: Store },
  { to: '/store/ranks', label: 'Ranks', icon: Crown },
  { to: '/store/crates', label: 'Crates', icon: KeyRound },
  { to: '/store/economy', label: 'Economy', icon: Coins },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
];

interface BottomNavProps {
  onNavigate?: () => void;
}

export function BottomNav({ onNavigate }: BottomNavProps) {
  const { itemCount } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-ink-900/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-2xl items-stretch justify-around px-1 py-1.5">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? 'text-accent-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative">
                  <Icon className="h-5 w-5" />
                  {label === 'Cart' && itemCount > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[9px] font-bold text-white">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </span>
                <span className="truncate">{label}</span>
                {isActive && (
                  <span className="absolute -top-1.5 h-0.5 w-8 rounded-full bg-accent-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
        <a
          href={DISCORD_INVITE || undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (!DISCORD_INVITE) e.preventDefault();
            onNavigate?.();
          }}
          className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-all duration-200 ${
            DISCORD_INVITE
              ? 'text-zinc-500 hover:text-zinc-300'
              : 'cursor-not-allowed text-zinc-600'
          }`}
          title={DISCORD_INVITE ? 'Join our Discord' : 'Discord link coming soon'}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="truncate">Discord</span>
        </a>
      </div>
    </nav>
  );
}
