"use client";

import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

export function DashboardHeaderActions() {
  const { profile, logout, isLoggingOut } = useAuth();
  const displayName = profile?.full_name?.trim() || "User";
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative size-9 rounded-full p-0" />
        }
      >
        <Avatar>
          <AvatarImage alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="font-medium">{displayName}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {profile?.email}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
