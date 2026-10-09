import "server-only";

import type { Testimonial } from "@/types/testimonial";

const DJANGO_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/$/, "");

/**
 * Fetch approved testimonials for the homepage (SSR). Returns [] if the
 * backend is unreachable so the page still renders.
 */
export async function getApprovedTestimonials(
  limit = 24,
): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${DJANGO_BASE}/testimonials/?limit=${limit}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as Testimonial[]) : [];
  } catch {
    return [];
  }
}
