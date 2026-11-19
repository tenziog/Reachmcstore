import type { CartItem } from '@/context/CartContext';
import { PRODUCTS, SERVER_IP } from '@/config';
import { supabase } from '@/lib/supabase';

export interface OrderLine {
  productId: string;
  name: string;
  category: string;
  quantity: number;
  unitPriceInr: number;
  lineTotalInr: number;
}

export type OrderStatus = 'pending' | 'verified' | 'completed' | 'cancelled';

export interface Order {
  orderId: string;
  minecraftUsername: string;
  discordUsername: string;
  lines: OrderLine[];
  totalInr: number;
  createdAtIso: string;
  status: OrderStatus;
}

export function generateOrderId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let suffix = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) suffix += chars[b % chars.length];
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `RMC-${y}${m}${d}-${suffix}`;
}

export function buildOrder(
  orderId: string,
  minecraftUsername: string,
  discordUsername: string,
  cartItems: CartItem[]
): Order | null {
  const lines: OrderLine[] = [];
  for (const item of cartItems) {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product) return null;
    lines.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      quantity: item.quantity,
      unitPriceInr: product.priceInr,
      lineTotalInr: product.priceInr * item.quantity,
    });
  }
  if (lines.length === 0) return null;
  return {
    orderId,
    minecraftUsername,
    discordUsername,
    lines,
    totalInr: lines.reduce((s, l) => s + l.lineTotalInr, 0),
    createdAtIso: new Date().toISOString(),
    status: 'pending',
  };
}

export async function createOrder(order: Order): Promise<void> {
  const { error } = await supabase.rpc('create_public_order', {
    p_order_id: order.orderId,
    p_minecraft_username: order.minecraftUsername,
    p_discord_username: order.discordUsername,
    p_items: order.lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    })),
  });

  if (error) throw error;
}

export async function loadOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc('get_public_order', {
    p_order_id: orderId,
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row || typeof row.order_id !== 'string' || !Array.isArray(row.items)) {
    return null;
  }

  const lines = row.items.filter(
    (item: unknown): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null
  ).map((item: Record<string, unknown>) => ({
    productId: String(item.productId),
    name: String(item.name),
    category: String(item.category),
    quantity: Number(item.quantity),
    unitPriceInr: Number(item.unitPriceInr),
    lineTotalInr: Number(item.lineTotalInr),
  }));

  if (
    typeof row.minecraft_username !== 'string' ||
    typeof row.discord_username !== 'string' ||
    typeof row.total_inr !== 'number' ||
    typeof row.created_at !== 'string' ||
    typeof row.status !== 'string'
  ) {
    return null;
  }

  return {
    orderId: row.order_id,
    minecraftUsername: row.minecraft_username,
    discordUsername: row.discord_username,
    lines,
    totalInr: row.total_inr,
    createdAtIso: row.created_at,
    status: row.status as OrderStatus,
  };
}

export function orderPath(orderId: string): string {
  return `/order/${encodeURIComponent(orderId)}`;
}

export function orderShareUrl(orderId: string): string {
  return `${window.location.origin}${window.location.pathname}#${orderPath(orderId)}`;
}

export function orderAsText(order: Order): string {
  const date = new Date(order.createdAtIso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const lines = order.lines
    .map(
      (l, i) =>
        `${i + 1}. ${l.name} x${l.quantity} — ₹${l.unitPriceInr} each = ₹${l.lineTotalInr}`
    )
    .join('\n');
  return [
    `REACHMC ORDER — ${order.orderId}`,
    `Status: ${order.status.toUpperCase()}${order.status === 'pending' ? ' (awaiting staff verification)' : ''}`,    ``,
    `Minecraft Username: ${order.minecraftUsername}`,
    `Discord Username: ${order.discordUsername}`,
    ``,
    `Products:`,
    lines,
    ``,
    `Total: ₹${order.totalInr}`,
    `Date: ${date}`,
    ``,
    `Server IP: ${SERVER_IP}`,
    `Summary link: ${orderShareUrl(order.orderId)}`,
  ].join('\n');
}
