"use client";

import { FadeIn } from "@/components/animations/fade-in";
import { PageContainer } from "@/components/layout/page-container";

const promises = [
  { title: "Thoughtfully curated", body: "Only pieces that feel personal." },
  { title: "Secure checkout", body: "Pay once. Track every order." },
  { title: "Shipped with care", body: "Packed to arrive ready to gift." },
] as const;

export function ShopPromise() {
  return (
    <section className="bg-[#2A1814] py-12 md:py-14">
      <PageContainer size="xl">
        <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {promises.map((item, index) => (
            <FadeIn key={item.title} delay={index * 0.06}>
              <li className="text-center">
                <p className="font-display text-lg text-[#F7EFE8]">
                  {item.title}
                </p>
                <p className="mt-1.5 text-sm text-[#F7EFE8]/65">{item.body}</p>
              </li>
            </FadeIn>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
