export const kyndlColors = {
  black: "#090909",
  blackSoft: "#111111",
  blackElevated: "#151515",
  red: "#B11226",
  redBright: "#C21830",
  redDeep: "#8E1020",
  redAccent: "#D7263D",
  ivory: "#F5E9E2",
  gold: "#D4A373",
  gray: "#B3B3B3",
} as const;

export const experiences = [
  {
    id: "love-cards",
    title: "Digital Love Cards",
    description: "Handwritten emotion, delivered at the perfect moment.",
    accent: "from-[#FF7A59]/25 to-transparent",
  },
  {
    id: "couple-games",
    title: "Couple Games",
    description: "Playful rituals that bring you closer, night after night.",
    accent: "from-[#F2596F]/25 to-transparent",
  },
  {
    id: "secret-messages",
    title: "Hidden Messages",
    description: "Words meant for one person — revealed when it matters.",
    accent: "from-[#F0A13D]/25 to-transparent",
  },
  {
    id: "surprise-gifting",
    title: "Surprise Gifting",
    description: "Anticipation built in — the reveal is the experience.",
    accent: "from-[#FF9A7B]/25 to-transparent",
  },
  {
    id: "midnight",
    title: "Midnight Deliveries",
    description: "Timed to the hour when feelings feel loudest.",
    accent: "from-[#F2596F]/20 to-transparent",
  },
  {
    id: "memory",
    title: "Memory Capsules",
    description: "Preserve a moment. Open it together, months later.",
    accent: "from-[#FF7A59]/20 to-transparent",
  },
  {
    id: "physical",
    title: "Physical Gifts",
    description: "Curated surprises that arrive with intention.",
    accent: "from-[#F0A13D]/20 to-transparent",
  },
  {
    id: "playlists",
    title: "Shared Playlists",
    description: "Soundtracks for the spaces between you.",
    accent: "from-[#FF9A7B]/20 to-transparent",
  },
] as const;

export const giftCollections = [
  {
    id: "digital-cards",
    title: "Digital Love Cards",
    tag: "Most shared",
    priceFrom: "from $4",
    description:
      "Animated cards with private notes, reveal effects, and timed delivery.",
    features: ["Name + photo personalization", "Open-on-date scheduling"],
    accent: "from-[#FF7A59]/30 via-[#F2596F]/15 to-transparent",
  },
  {
    id: "micro-games",
    title: "Digital Couple Games",
    tag: "Date night",
    priceFrom: "from $7",
    description:
      "Playful quizzes, challenge decks, and intimacy prompts you can play together.",
    features: ["Difficulty presets", "Long-distance friendly mode"],
    accent: "from-[#F2596F]/30 via-[#FF9A7B]/15 to-transparent",
  },
  {
    id: "memory-capsules",
    title: "Memory Capsules",
    tag: "Best for anniversaries",
    priceFrom: "from $9",
    description:
      "A private time-locked message with voice notes, photos, and mini surprise reveals.",
    features: ["Voice + photo bundles", "Timed unlock links"],
    accent: "from-[#F0A13D]/30 via-[#FF7A59]/15 to-transparent",
  },
  {
    id: "surprise-boxes",
    title: "Custom Surprise Boxes",
    tag: "Premium",
    priceFrom: "from $12",
    description:
      "Curated digital bundles that combine a card, game, and hidden keepsake in one flow.",
    features: ["Occasion templates", "Guided story builder"],
    accent: "from-[#FF9A7B]/30 via-[#F2596F]/15 to-transparent",
  },
] as const;

export const testimonials = [
  {
    quote: "She opened it at midnight and cried.",
    attribution: "— M., long-distance",
  },
  {
    quote: "It felt more personal than any physical gift.",
    attribution: "— J. & R., together 4 years",
  },
  {
    quote: "Distance suddenly felt smaller.",
    attribution: "— A., across time zones",
  },
] as const;
