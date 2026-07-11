"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { User } from "@/types/user";

/** First name for the compact greeting; falls back to the email handle. */
function shortName(user: User): string {
  const first = user.full_name?.trim().split(" ")[0];
  return first || user.email.split("@")[0] || "You";
}

function initialsOf(user: User): string {
  const name = user.full_name?.trim() || user.email;
  return (
    name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

/**
 * The signed-in user's control in the marketing header — replaces the
 * Log in / Get Started buttons. Reads the auth store directly (not `useAuth`)
 * so the globally-rendered header never pulls `useSearchParams` into every
 * marketing page.
 */
export function HeaderUserMenu() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const logout = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push(ROUTES.home);
      toast.success("Signed out");
    },
  });

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className="inline-flex items-center gap-2 rounded-full border border-[#F2DACE] bg-white/70 py-1 pr-3 pl-1 text-sm text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50 hover:bg-white aria-expanded:border-[#FF7A59]/50 aria-expanded:bg-white"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-[#FF7A59]/15 text-[#C75B39]">
            {initialsOf(user)}
          </AvatarFallback>
        </Avatar>
        <span className="max-w-[8rem] truncate font-medium">
          {shortName(user)}
        </span>
        <ChevronDown className="size-3.5 text-[#92786C]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="font-medium">{user.full_name?.trim() || "Your account"}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {user.email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={ROUTES.dashboard} />}>
          <LayoutDashboard className="mr-2 size-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          variant="destructive"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
