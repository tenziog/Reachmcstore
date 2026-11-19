export const SERVER_IP = 'ReachMc.fun';
export const DISCORD_INVITE =
  import.meta.env.VITE_DISCORD_INVITE || 'https://discord.gg/krrJuzf4Zb';
export const MC_STATUS_API_URL =
  import.meta.env.VITE_MCSTATUS_API_URL ||
  `https://api.mcsrvstat.us/3/${SERVER_IP}`;

export const SITE_NAME = 'REACHMC';
export const OWNER = 'Tenzi';
export const TAGLINE = 'YOUR SURVIVAL. YOUR ECONOMY. YOUR LEGACY.';

export type Category = 'ranks' | 'crates' | 'economy';

export interface Product {
  id: string;
  name: string;
  category: Category;
  priceInr: number;
  description: string;
  perks: string[];
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 'rank-elite',
    name: 'ELITE',
    category: 'ranks',
    priceInr: 20,
    description: 'Your first step into the ReachMC inner circle.',
    perks: ['Access to Elite Kit', '/echeast command'],
  },
  {
    id: 'rank-titan',
    name: 'TITAN',
    category: 'ranks',
    priceInr: 40,
    description: 'More power, more homes, more reach.',
    perks: ['Access to Titan Kit', '/echeast command', 'Up to 10 homes'],
  },
  {
    id: 'rank-immortal',
    name: 'IMMORTAL',
    category: 'ranks',
    priceInr: 60,
    description: 'A legendary presence on the server.',
    perks: ['Access to Immortal Kit', '/echeast command', 'Up to 15 homes'],
    featured: true,
  },
  {
    id: 'rank-reach',
    name: 'REACH',
    category: 'ranks',
    priceInr: 80,
    description: 'The ultimate rank. The name of the network.',
    perks: [
      'Access to Reach Kit',
      'Access to Immortal Kit',
      '/echeast command',
      'Up to 20 homes',
    ],
  },
  {
    id: 'key-special',
    name: 'Special Key',
    category: 'crates',
    priceInr: 5,
    description: 'Unlock the Special crate for a chance at rare loot.',
    perks: ['1x Special Key', 'Redeemable at /warp crates'],
  },
  {
    id: 'key-spawner',
    name: 'Spawner Key',
    category: 'crates',
    priceInr: 7,
    description: 'Crack open the Spawner crate — spawner drops inside.',
    perks: ['1x Spawner Key', 'Redeemable at /warp crates'],
  },
  {
    id: 'money-1m',
    name: '1 Million Money',
    category: 'economy',
    priceInr: 30,
    description: '₹1,000,000 delivered straight to your in-game balance.',
    perks: ['1,000,000 in-game currency', 'Delivered within minutes'],
  },
  {
    id: 'money-2m',
    name: '2 Million Money',
    category: 'economy',
    priceInr: 60,
    description: 'Double the funds for serious builders and traders.',
    perks: ['2,000,000 in-game currency', 'Delivered within minutes'],
  },
];

export const CATEGORY_LABELS: Record<Category | 'all', string> = {
  all: 'All Products',
  ranks: 'Ranks',
  crates: 'Crate Keys',
  economy: 'In-Game Money',
};
