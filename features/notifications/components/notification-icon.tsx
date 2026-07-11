"use client";

import {
  Bell,
  Gift,
  Heart,
  type LucideIcon,
  MessageCircle,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  Truck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

// Maps the backend's `payload.icon` name (set by each NotificationType) to a
// lucide icon. Unknown / missing names fall back to a bell.
const ICONS: Record<string, LucideIcon> = {
  "message-circle": MessageCircle,
  "message-square": MessageSquare,
  heart: Heart,
  gift: Gift,
  users: Users,
  "user-check": UserCheck,
  star: Star,
  "shopping-bag": ShoppingBag,
  truck: Truck,
  package: Package,
  "x-circle": XCircle,
};

export function NotificationIcon({ name }: { name?: string }) {
  const Icon = (name && ICONS[name]) || Bell;
  return <Icon className="size-4" />;
}
