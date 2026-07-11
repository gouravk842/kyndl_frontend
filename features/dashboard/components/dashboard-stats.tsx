"use client";

import { BookHeart, CheckCircle2, PenLine } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatsProps {
  total: number;
  published: number;
  drafts: number;
}

/** Three honest counts derived from the creations list — no vanity metrics. */
export function DashboardStats({ total, published, drafts }: DashboardStatsProps) {
  const stats = [
    { label: "Creations", value: total, icon: BookHeart, hint: "memory keepsakes made" },
    { label: "Published", value: published, icon: CheckCircle2, hint: "ready to share" },
    { label: "Drafts", value: drafts, icon: PenLine, hint: "still in progress" },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, hint }) => (
        <Card key={label}>
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
