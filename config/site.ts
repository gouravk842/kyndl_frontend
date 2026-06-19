import { clientEnv } from "@/config/env";

export const siteConfig = {
  name: clientEnv.NEXT_PUBLIC_APP_NAME,
  url: clientEnv.NEXT_PUBLIC_APP_URL,
  description:
    "Kyndl — an emotional experience platform for digital moments, hidden messages, couple games, and curated surprises.",
  keywords: [
    "emotional gifting",
    "digital love cards",
    "couple experiences",
    "surprise moments",
    "relationship gifts",
    "kyndl",
  ] as const,
  links: {
    twitter: "https://twitter.com/kyndl",
    github: "https://github.com/kyndl",
    docs: "/docs",
  },
  creator: "Kyndl Inc.",
} as const;
