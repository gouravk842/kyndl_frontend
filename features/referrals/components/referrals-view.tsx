"use client";

import {
  Check,
  Copy,
  Gift,
  Link2,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/shared/page-header";
import {
  useReferralConversions,
  useReferralLinks,
  useReferralProfile,
} from "@/hooks/use-referrals";
import { formatPrice } from "@/lib/gifts";
import { cn } from "@/lib/utils";
import { track } from "@/services/analytics/analytics.service";
import type { ReferralLinkItem } from "@/types/referral";

export function ReferralsView() {
  const profile = useReferralProfile();
  const links = useReferralLinks();
  const conversions = useReferralConversions();
  const [copied, setCopied] = useState<string | null>(null);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success(`${label} copied`);
      track({
        name: "referral.link_copied",
        properties: { label, url: text },
      });
      window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 2000);
    } catch {
      toast.error("Could not copy — try selecting the link.");
    }
  }

  const busy = profile.isLoading || links.isLoading;

  return (
    <>
      <PageHeader
        compact
        eyebrow="Share & earn"
        title="Referrals"
        subtitle="Share any experience or gift. When someone buys from your link, we track it and credit your ledger."
      />

      <PageContainer size="lg" className="space-y-10 py-10 md:py-14">
        {busy ? (
          <div className="flex justify-center py-20 text-[#C75B39]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : profile.isError || !profile.data ? (
          <p className="py-20 text-center text-[#7A6258]">
            We couldn&apos;t load your referral profile. Please refresh.
          </p>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Your code"
                value={profile.data.code}
                action={
                  <button
                    type="button"
                    onClick={() => copyText(profile.data!.code, "Code")}
                    className="inline-flex items-center gap-1 text-xs text-[#C75B39] hover:underline"
                  >
                    {copied === profile.data.code ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    Copy
                  </button>
                }
              />
              <Stat label="Clicks" value={String(profile.data.click_count)} />
              <Stat
                label="Conversions"
                value={String(profile.data.conversion_count)}
              />
              <Stat
                label="Pending credit"
                value={formatPrice(profile.data.pending_credit_paise)}
                hint={
                  profile.data.issued_credit_paise
                    ? `${formatPrice(profile.data.issued_credit_paise)} issued`
                    : undefined
                }
              />
            </section>

            {links.data?.general_url && (
              <section className="rounded-3xl border border-[#F4DDD0] bg-white/80 p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium tracking-wide text-[#C75B39] uppercase">
                      General link
                    </p>
                    <p className="mt-1 break-all font-mono text-sm text-[#3A2A25]">
                      {links.data.general_url}
                    </p>
                  </div>
                  <CopyButton
                    active={copied === links.data.general_url}
                    onClick={() => copyText(links.data!.general_url, "Link")}
                  />
                </div>
              </section>
            )}

            <LinkSection
              title="Experiences"
              icon={<Sparkles className="size-4" />}
              items={links.data?.experiences ?? []}
              copied={copied}
              onCopy={copyText}
            />

            <LinkSection
              title="Gifts"
              icon={<Gift className="size-4" />}
              items={links.data?.gifts ?? []}
              copied={copied}
              onCopy={copyText}
            />

            <section>
              <h2 className="font-display text-xl text-[#3A2A25]">
                Recent conversions
              </h2>
              <p className="mt-1 text-sm text-[#7A6258]">
                Rewards stay pending until we issue them — you&apos;ll see the
                status here.
              </p>

              {conversions.isLoading ? (
                <div className="flex justify-center py-12 text-[#C75B39]">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : !conversions.data?.results.length ? (
                <div className="mt-6 rounded-3xl border border-dashed border-[#F2DACE] bg-white/60 py-14 text-center">
                  <Share2 className="mx-auto size-9 text-[#E3A78C]" />
                  <p className="mt-3 font-display text-lg text-[#3A2A25]">
                    No conversions yet
                  </p>
                  <p className="mt-1 text-sm text-[#7A6258]">
                    Share a product link and we&apos;ll track purchases here.
                  </p>
                </div>
              ) : (
                <ul className="mt-5 flex flex-col gap-3">
                  {conversions.data.results.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#F4DDD0] bg-white px-5 py-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#3A2A25]">
                          {row.target_kind}
                          {row.target_slug ? ` · ${row.target_slug}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-[#B08C7D]">
                          {formatPrice(row.amount_paise)} ·{" "}
                          {new Date(row.created_at).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium text-[#3A2A25]">
                          {row.reward
                            ? formatPrice(row.reward.amount_paise)
                            : "—"}
                        </p>
                        <p
                          className={cn(
                            "text-xs capitalize",
                            row.reward?.status === "issued" && "text-[#2fb672]",
                            row.reward?.status === "pending" &&
                              "text-[#C75B39]",
                            row.reward?.status === "void" && "text-[#B08C7D]",
                          )}
                        >
                          {row.reward?.status ?? row.status}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </PageContainer>
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  action,
}: {
  label: string;
  value: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[#F4DDD0] bg-white/80 px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-[#B08C7D] uppercase">
          {label}
        </p>
        {action}
      </div>
      <p className="mt-2 font-display text-2xl tracking-tight text-[#3A2A25]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[#7A6258]">{hint}</p> : null}
    </div>
  );
}

function LinkSection({
  title,
  icon,
  items,
  copied,
  onCopy,
}: {
  title: string;
  icon: React.ReactNode;
  items: ReferralLinkItem[];
  copied: string | null;
  onCopy: (text: string, label: string) => void;
}) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="flex items-center gap-2 font-display text-xl text-[#3A2A25]">
        {icon}
        {title}
      </h2>
      <ul className="mt-4 divide-y divide-[#F4DDD0] overflow-hidden rounded-3xl border border-[#F4DDD0] bg-white">
        {items.map((item) => (
          <li
            key={`${item.kind}-${item.slug}`}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#3A2A25]">
                {item.name}
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-[#B08C7D]">
                {item.url}
              </p>
            </div>
            <CopyButton
              active={copied === item.url}
              onClick={() => onCopy(item.url, item.name)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CopyButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#F2DACE] bg-[#FFF7F1] px-3 text-xs font-medium text-[#3A2A25] transition-colors hover:border-[#FF7A59]/50"
    >
      {active ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
      {active ? "Copied" : "Copy link"}
    </button>
  );
}
