/**
 * Single source of truth for Kyndl's experiences (products).
 *
 * Powers three surfaces:
 *   - the landing bento  (`featuredExperiences` — the live ones)
 *   - the /experiences listing page (all of them, with status)
 *   - the /experiences/[slug] product pages (live ones get a marketing page)
 *
 * `icon` values are lucide names resolved via `lib/experience-icons`.
 */

export type ExperienceStatus = "live" | "soon";

export type ExperienceHighlight = {
  icon: string;
  title: string;
  description: string;
};

export type ExperienceStep = {
  title: string;
  description: string;
};

export type Experience = {
  slug: string;
  name: string;
  eyebrow: string;
  /** Short line used on cards. */
  tagline: string;
  /** Fuller paragraph used on the product page hero. */
  description: string;
  icon: string;
  status: ExperienceStatus;
  /** The live, interactive route. `null` while a product is still "soon". */
  liveHref: string | null;
  /** Hover wash gradient for cards. */
  accent: string;
  /** Big preview block background on the product page + listing. */
  previewGradient: string;
  /** Bento weight on the landing gallery. */
  span: "feature" | "wide" | "small";
  /**
   * When true, the live experience is rendered inline on its product page
   * (`/experiences/<slug>`) — there is no separate live route. The product page
   * and the experience are one and the same.
   */
  embedded?: boolean;
  /**
   * When true, the live experience plays inside the right-hand preview card of
   * the two-column product hero (instead of the static gradient placeholder),
   * while the left column keeps its copy and CTAs. Unlike `embedded`, the hero
   * layout is unchanged. `liveHref` still points at the standalone fullscreen
   * route, surfaced as an "Open full screen" CTA.
   */
  inlineEmbed?: boolean;
  /** Where the "Make your own" CTA goes (a builder). Defaults to /register. */
  makeHref?: string;
  /**
   * Adults-only "Red Zone" experience. Kept off the main landing bento and
   * surfaced only in the dedicated 18+ section; the experience itself also
   * renders its own age gate before any content shows.
   */
  adult?: boolean;
  highlights: ExperienceHighlight[];
  steps: ExperienceStep[];
};

export const experiences: Experience[] = [
  {
    slug: "scrapbook",
    name: "Digital Scrapbook",
    eyebrow: "A keepsake",
    tagline:
      "A handcrafted memory book you turn page by page — polaroids, handwritten notes, and voices you can hear again.",
    description:
      "A real, page-turning memory book, reimagined for the screen. Fill it with polaroids, handwritten captions, washi-taped keepsakes, and audio notes — then watch them turn the pages, one moment at a time.",
    icon: "BookHeart",
    status: "live",
    liveHref: "/experiences/scrapbook",
    embedded: true,
    makeHref: "/scrapbook/build",
    accent: "from-[#FF7A59]/22 via-[#F2596F]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 30%, #fffdf6 0%, #f7e6cf 55%, #efd6b8 100%)",
    span: "feature",
    highlights: [
      {
        icon: "Camera",
        title: "Polaroids & photos",
        description: "Drop in the snapshots that tell your story.",
      },
      {
        icon: "PenLine",
        title: "Handwritten notes",
        description: "Captions in a warm, handwritten voice.",
      },
      {
        icon: "Mic",
        title: "Audio keepsakes",
        description: "Tuck a voice note onto any page.",
      },
    ],
    steps: [
      {
        title: "Add your pages",
        description: "Gather the photos and moments worth keeping.",
      },
      {
        title: "Write & decorate",
        description: "Add notes, tape, and little hidden messages.",
      },
      {
        title: "Share the book",
        description: "Send a link they can turn, page by page.",
      },
    ],
  },
  {
    slug: "memory-pages",
    name: "Memory Pages",
    eyebrow: "A photo album",
    tagline:
      "A page-turning photo album — drop in your photos, add a few words, and flip through them like a real book.",
    description:
      "A handcrafted photo album you turn page by page. Lay your photos out as polaroids on a warm desk, give each a title and a few lines, then watch them turn — one page, one memory at a time.",
    icon: "Images",
    status: "live",
    liveHref: "/experiences/memory-pages",
    embedded: true,
    makeHref: "/memory-pages/build",
    accent: "from-[#F0A13D]/22 via-[#FF7A59]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 30%, #fffdf6 0%, #f0dcc0 55%, #d8b88f 100%)",
    span: "wide",
    highlights: [
      {
        icon: "Camera",
        title: "Photos as polaroids",
        description: "Every picture laid out like a print on a desk.",
      },
      {
        icon: "PenLine",
        title: "A title & a story",
        description: "Caption each photo and add a few warm lines.",
      },
      {
        icon: "BookHeart",
        title: "Turn the pages",
        description: "Flip through it like a real, bound album.",
      },
    ],
    steps: [
      {
        title: "Add your pages",
        description: "Pick a layout and drop your photos in.",
      },
      {
        title: "Write it up",
        description: "Give each photo a title, place, and story.",
      },
      {
        title: "Share the album",
        description: "Send a link they can flip through, page by page.",
      },
    ],
  },
  {
    slug: "constellation",
    name: "Constellation",
    eyebrow: "A private sky",
    tagline:
      "A private night sky. Every star is a moment you shared — trace the shape only the two of you would know.",
    description:
      "A quiet night sky that belongs to just the two of you. Each bright star is a memory; the lines between them trace a shape only you'd recognise. Touch a star and the moment opens.",
    icon: "Sparkles",
    status: "live",
    liveHref: "/constellation",
    makeHref: "/constellation/build",
    accent: "from-[#F0A13D]/22 via-[#FF7A59]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 70% 25%, #2a2350 0%, #161033 60%, #0d0a22 100%)",
    span: "wide",
    highlights: [
      {
        icon: "Stars",
        title: "A star per memory",
        description: "Every moment becomes a point of light.",
      },
      {
        icon: "Moon",
        title: "Guided night tour",
        description: "Let it fly star to star, telling the story.",
      },
      {
        icon: "Sparkles",
        title: "A hidden finale",
        description: "A shape ignites once every star is read.",
      },
    ],
    steps: [
      {
        title: "Place your stars",
        description: "Set a star for each moment that mattered.",
      },
      {
        title: "Write each memory",
        description: "Give every star the words it deserves.",
      },
      {
        title: "Reveal the shape",
        description: "Watch the secret it was spelling light up.",
      },
    ],
  },
  {
    slug: "memory-city",
    name: "Memory City",
    eyebrow: "A world of memories",
    tagline:
      "A living 3D city that builds itself from your memories — wander it together and open each one.",
    description:
      "Every memory becomes a place in a city that arranges and grows itself as you add to it. Walk its streets at dusk, find the glowing buildings that hold your moments, and open them one by one.",
    icon: "Building2",
    status: "live",
    liveHref: "/memory-city",
    makeHref: "/memory-city/build",
    accent: "from-[#7FD9FF]/22 via-[#A98BFF]/10 to-transparent",
    previewGradient:
      "linear-gradient(160deg, #2a2f6b 0%, #4a4a8a 45%, #f0a868 100%)",
    span: "wide",
    highlights: [
      {
        icon: "Building2",
        title: "A city that grows",
        description: "Add a memory and the city rearranges and expands itself.",
      },
      {
        icon: "Navigation",
        title: "Roam freely",
        description: "Wander the streets on foot, or take the guided tour.",
      },
      {
        icon: "Sparkles",
        title: "Unlock each memory",
        description: "Some are sealed behind a little puzzle only you two solve.",
      },
    ],
    steps: [
      {
        title: "Add your memories",
        description: "Give each one a date, a mood, and a few words.",
      },
      {
        title: "Watch the city form",
        description: "Your moments arrange into districts, era by era.",
      },
      {
        title: "Send them in",
        description: "They explore the city and open every memory.",
      },
    ],
  },
  {
    slug: "chocolate-bouquet",
    name: "Chocolate Bouquet",
    eyebrow: "A bouquet of memories",
    tagline:
      "A 3D bouquet of chocolates — each one a memory they tear open, wrapper and all.",
    description:
      "A hand-tied bouquet where every chocolate is a memory. They pick one, peel the foil back with a drag, and the moment tucked inside slides out — a photo, a note, a secret, a milestone, or your voice. One sweet at a time.",
    icon: "Gift",
    status: "live",
    liveHref: "/chocolate-bouquet",
    makeHref: "/chocolate-bouquet/build",
    accent: "from-[#F0A13D]/22 via-[#D6465A]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 85% 75% at 50% 35%, #3a1622 0%, #240d16 55%, #150810 100%)",
    span: "wide",
    highlights: [
      {
        icon: "Gift",
        title: "A chocolate per memory",
        description: "Every moment becomes a wrapped sweet in the bouquet.",
      },
      {
        icon: "Hand",
        title: "Tear it open",
        description: "Drag the foil back to unwrap each one, just like the real thing.",
      },
      {
        icon: "Sparkles",
        title: "Five kinds of sweet",
        description: "Photos, notes, secrets, milestones, and voice notes.",
      },
    ],
    steps: [
      {
        title: "Fill the bouquet",
        description: "Add a chocolate for each memory and pick its kind.",
      },
      {
        title: "Write what's inside",
        description: "Give every chocolate the moment it holds.",
      },
      {
        title: "Send it over",
        description: "They unwrap the bouquet, one sweet at a time.",
      },
    ],
  },
  {
    slug: "memory-lantern",
    name: "Memory Lantern",
    eyebrow: "A living light",
    tagline:
      "A slowly turning lantern of glowing photo-facets — the side facing you wakes, and lights the room its colour.",
    description:
      "A softly glowing lantern that floats in a warm dark room. Every facet holds a memory; as it turns, the one facing you wakes — sharpens, tells its moment — while the whole room glows that photo's colour. Add more memories and the lantern grows, from a simple cube toward a glowing orb.",
    icon: "Flame",
    status: "live",
    liveHref: "/memory-lantern",
    makeHref: "/memory-lantern/build",
    accent: "from-[#F0C48A]/22 via-[#E07A5F]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 65% 60% at 50% 42%, #4a2f1e 0%, #241019 55%, #0a0710 100%)",
    span: "wide",
    highlights: [
      {
        icon: "Flame",
        title: "It lights the room",
        description: "The room glows the colour of whichever memory is facing you.",
      },
      {
        icon: "Images",
        title: "A facet per memory",
        description: "Each side wakes and tells its moment as it turns to face you.",
      },
      {
        icon: "Sparkles",
        title: "It grows with you",
        description: "Add memories and the lantern grows from a cube toward an orb.",
      },
    ],
    steps: [
      {
        title: "Add your photos",
        description: "Each becomes a glowing facet with a caption and date.",
      },
      {
        title: "Set it turning",
        description: "Choose how it spins, glows, and warms with the hour.",
      },
      {
        title: "Send the light",
        description: "They watch it turn, waking one memory at a time.",
      },
    ],
  },
  {
    slug: "memory-jar",
    name: "Memory Jar",
    eyebrow: "A keepsake",
    tagline:
      "A glass jar of folded notes — open any one to read a little something written just for you.",
    description:
      "A handcrafted glass jar brimming with folded notes. Reach in, unfold any one, and read a little something written just for them — a warm, intimate ritual they'll return to.",
    icon: "Heart",
    status: "live",
    liveHref: "/memory-jar",
    makeHref: "/memory-jar/build",
    accent: "from-[#FF9A7B]/22 to-transparent",
    previewGradient:
      "linear-gradient(160deg, #fdf3e7 0%, #f5e0c3 60%, #ead5b0 100%)",
    span: "small",
    highlights: [
      {
        icon: "Heart",
        title: "Hundreds of notes",
        description: "Fill the jar with as much as you feel.",
      },
      {
        icon: "PenLine",
        title: "Write in your voice",
        description: "Every note in your own handwriting style.",
      },
      {
        icon: "Gift",
        title: "Open one a day",
        description: "A little something to return to, anytime.",
      },
    ],
    steps: [
      {
        title: "Write your notes",
        description: "From one-liners to whole love letters.",
      },
      {
        title: "Fill the jar",
        description: "Fold them in and seal it shut.",
      },
      {
        title: "Hand it over",
        description: "Send the jar and let them reach in.",
      },
    ],
  },
  {
    slug: "our-places",
    name: "Our Places",
    eyebrow: "A love letter, mapped",
    tagline:
      "A love letter drawn on a map — a glowing pin for every place that's part of your story.",
    description:
      "A love letter drawn across a map. Drop a glowing pin on every place that's part of you two — where you met, where you said it first — and let each one open into the memory it holds.",
    icon: "MapPin",
    status: "live",
    liveHref: "/our-places",
    inlineEmbed: true,
    makeHref: "/our-places/build",
    accent: "from-[#FF7A59]/22 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 40% 35%, #ffe9d2 0%, #f6c9a3 55%, #e89f74 100%)",
    span: "small",
    highlights: [
      {
        icon: "MapPin",
        title: "Pin your places",
        description: "Mark every spot that's part of your story.",
      },
      {
        icon: "Navigation",
        title: "Wander the map",
        description: "Glide between glowing pins, one by one.",
      },
      {
        icon: "Image",
        title: "A memory per pin",
        description: "Each place opens into the moment it holds.",
      },
    ],
    steps: [
      {
        title: "Drop your pins",
        description: "Place the spots that matter most.",
      },
      {
        title: "Tell each story",
        description: "Add the memory behind every place.",
      },
      {
        title: "Send the map",
        description: "Let them trace your story, place by place.",
      },
    ],
  },
  {
    slug: "ludo",
    name: "Ludo for Two",
    eyebrow: "Play together",
    tagline:
      "Classic Ludo, reimagined for date night — real dice, captures, and a couple-activity mode.",
    description:
      "The Ludo you grew up with, reimagined for two. Realistic dice, satisfying captures, and a tunable couple-activity mode that turns a board game into a date night.",
    icon: "Gamepad2",
    status: "live",
    liveHref: "/games/ludo",
    makeHref: "/ludo/build",
    accent: "from-[#F2596F]/22 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 70% at 50% 38%, #fffaf4 0%, #fbeede 55%, #f4e0cb 100%)",
    span: "small",
    highlights: [
      {
        icon: "Dice5",
        title: "Realistic dice",
        description: "Weighty rolls and proper captures.",
      },
      {
        icon: "Users",
        title: "Built for two",
        description: "Made to play across the couch or the world.",
      },
      {
        icon: "Heart",
        title: "Couple mode",
        description: "A tunable activity twist for date night.",
      },
    ],
    steps: [
      {
        title: "Open the board",
        description: "Jump in instantly — no setup, no sign-up.",
      },
      {
        title: "Roll & play",
        description: "Take turns, chase pieces, capture and cheer.",
      },
      {
        title: "Settle the score",
        description: "First one home wins the bragging rights.",
      },
    ],
  },
  {
    slug: "time-capsule",
    name: "Time Capsule",
    eyebrow: "Sealed for later",
    tagline:
      "Seal a message today and let it unlock on a date that matters — a birthday, an anniversary, a year from now.",
    description:
      "Seal a message today and let it unlock exactly when it should — a birthday, an anniversary, a year from now.",
    icon: "Hourglass",
    status: "live",
    liveHref: "/time-capsule",
    makeHref: "/time-capsule/build",
    accent: "from-[#F0A13D]/22 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 35%, #fff1dc 0%, #f3cf9c 60%, #e3ad6e 100%)",
    span: "small",
    highlights: [
      {
        icon: "Lock",
        title: "Sealed until the day",
        description: "It stays locked, teasing a live countdown, until you say.",
      },
      {
        icon: "BookHeart",
        title: "A letter that waits",
        description: "Write a message and add photos to open on the date.",
      },
      {
        icon: "Sparkles",
        title: "Opens on its own",
        description: "When the moment arrives, the capsule cracks open itself.",
      },
    ],
    steps: [
      {
        title: "Write & seal",
        description: "Compose your letter, add photos, and pick the unlock date.",
      },
      {
        title: "Send it forward",
        description: "Share the link — it stays sealed no matter who opens it.",
      },
      {
        title: "Let it open",
        description: "On the day, the capsule unlocks and reveals what you left.",
      },
    ],
  },
  {
    slug: "countdown",
    name: "Countdown",
    eyebrow: "Building anticipation",
    tagline:
      "A shared countdown to the moment you're both waiting for — with a little surprise when it hits zero.",
    description:
      "A shared countdown to the moment you're both waiting for. Watch the clock tick down together — and when it finally hits zero, a surprise you wrote opens, confetti and all.",
    icon: "Calendar",
    status: "live",
    liveHref: "/countdown",
    makeHref: "/countdown/build",
    accent: "from-[#FF9A7B]/22 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 35%, #ffe7e0 0%, #f7b9ac 60%, #ec8f86 100%)",
    span: "small",
    highlights: [
      {
        icon: "Hourglass",
        title: "A clock you share",
        description: "Days, hours, minutes, seconds — ticking together.",
      },
      {
        icon: "PenLine",
        title: "Notes to keep them company",
        description: "Little messages they can open while they wait.",
      },
      {
        icon: "Gift",
        title: "A surprise at zero",
        description: "The clock dissolves into the reveal you wrote.",
      },
    ],
    steps: [
      {
        title: "Set the moment",
        description: "Pick the date, the theme, and who it's for.",
      },
      {
        title: "Write the surprise",
        description: "The message — and photo — that lands at zero.",
      },
      {
        title: "Share the countdown",
        description: "Send a link and count it down together.",
      },
    ],
  },
  {
    slug: "spotify-plaque",
    name: "Spotify Plaque",
    eyebrow: "A framed keepsake",
    tagline:
      "A framed photo plaque with your song playing behind it — and a wrapped gift box that opens to a hidden message.",
    description:
      "A keepsake plaque, framed like a print on a shelf. Your photos cross-fade inside the frame while your song plays underneath, styled with a Spotify-code scan strip. Beside it sits a wrapped gift box — tap it and the lid lifts to a private message written just for them.",
    icon: "Music",
    status: "live",
    liveHref: "/spotify-plaque",
    makeHref: "/spotify-plaque/build",
    accent: "from-[#1db954]/22 via-[#FF7A59]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 30%, #fbf4ea 0%, #f3e7d6 55%, #e7d3bd 100%)",
    span: "wide",
    highlights: [
      {
        icon: "Images",
        title: "A photo slideshow",
        description: "Your pictures cross-fade inside the frame.",
      },
      {
        icon: "Music",
        title: "Your song, playing",
        description: "Upload the track — it loops behind the plaque.",
      },
      {
        icon: "Gift",
        title: "A gift box to open",
        description: "Tap it and it opens to a hidden message.",
      },
    ],
    steps: [
      {
        title: "Add photos & your song",
        description: "Upload the pictures and the track that's yours.",
      },
      {
        title: "Write the hidden message",
        description: "The note the gift box opens to reveal.",
      },
      {
        title: "Share the plaque",
        description: "Send a link they can play, watch, and open.",
      },
    ],
  },
  {
    slug: "string-frame",
    name: "String Frame",
    eyebrow: "A gift-countdown board",
    tagline:
      "A chalkboard board with a big colourful name and your photos pinned across a string — beside a gift box that opens to a hidden message.",
    description:
      "A hand-drawn chalkboard, the kind you'd tape above a bed. Their name sprawls across it in bright, mismatched letters, your favourite photos hang pinned along a string, and little chalk doodles fill the gaps. Next to it waits a wrapped gift box — tap it and the lid lifts to a private message, your song playing all the while.",
    icon: "Images",
    status: "live",
    liveHref: "/string-frame",
    makeHref: "/string-frame/build",
    accent: "from-[#ff5d73]/22 via-[#4aa8ff]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 35%, #2a2a2e 0%, #17171a 55%, #0d0d0f 100%)",
    span: "wide",
    highlights: [
      {
        icon: "PenLine",
        title: "A name in bright chalk",
        description: "Their name, big and colourful across the board.",
      },
      {
        icon: "Camera",
        title: "Photos on a string",
        description: "Your pictures pinned across it on clothespins.",
      },
      {
        icon: "Gift",
        title: "A gift box to open",
        description: "Tap it and it opens to a hidden message.",
      },
    ],
    steps: [
      {
        title: "Write the name & pin photos",
        description: "Add the name and clip your photos on the string.",
      },
      {
        title: "Hide a message",
        description: "The note the gift box opens to reveal.",
      },
      {
        title: "Share the frame",
        description: "Send a link they can look at and open.",
      },
    ],
  },
  {
    slug: "timeless-treasure",
    name: "Timeless Treasure",
    eyebrow: "A keepsake box",
    tagline:
      "A digital keepsake box they open once — the lid lifts, a film strip rises out, and your photos develop frame by frame as they unspool the reel.",
    description:
      "A treasure box, reimagined for the screen. They tap it and the lid lifts, light spilling out as a strip of film rises from inside. Pulling the reel unspools it frame by frame — each photo developing from a sepia ghost into a sharp memory — down to a folded letter that unfolds and an engraved keepsake tag, made of happy memories.",
    icon: "Gift",
    status: "live",
    liveHref: "/timeless-treasure",
    makeHref: "/timeless-treasure/build",
    accent: "from-[#c07a2c]/22 via-[#FF7A59]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 30%, #fbf3e6 0%, #efdcbe 55%, #dcbc90 100%)",
    span: "wide",
    highlights: [
      {
        icon: "Gift",
        title: "A box to open",
        description: "Tap it and the lid lifts to a film strip rising out.",
      },
      {
        icon: "Images",
        title: "A reel that develops",
        description: "Photos sharpen from sepia ghosts as you unspool it.",
      },
      {
        icon: "PenLine",
        title: "A letter & a tag",
        description: "A folded note that unfolds, and an engraved keepsake plate.",
      },
    ],
    steps: [
      {
        title: "Load the reel",
        description: "Add your photos and caption each frame.",
      },
      {
        title: "Engrave & write",
        description: "Set the keepsake tag and tuck in a letter.",
      },
      {
        title: "Share the treasure",
        description: "Send a link they open, unspool, and keep.",
      },
    ],
  },
  {
    slug: "proposal",
    name: "The Big Question",
    eyebrow: "A moment",
    tagline:
      "A paced, cinematic proposal they live one breath at a time — then their yes comes straight back to you.",
    description:
      "Not a card to read at leisure — a moment to live. Break the seal, walk a slow approach of your own words and memories, and arrive at the question. When they say yes, the screen blooms and the answer travels right back to you.",
    icon: "Heart",
    status: "live",
    liveHref: "/proposal",
    makeHref: "/proposal/build",
    accent: "from-[#7c6cff]/22 via-[#f4768e]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 80% 65% at 50% 20%, #2a2350 0%, #171331 55%, #0a0820 100%)",
    span: "wide",
    highlights: [
      {
        icon: "Sparkles",
        title: "A paced approach",
        description: "Beats they feel one deliberate tap at a time.",
      },
      {
        icon: "Heart",
        title: "The question",
        description: "With a playful “No” that can't quite be caught.",
      },
      {
        icon: "Gift",
        title: "Their yes comes back",
        description: "The instant they answer, you're notified.",
      },
    ],
    steps: [
      {
        title: "Write the approach",
        description: "A few lines, a memory, the days you've counted.",
      },
      {
        title: "Set the question",
        description: "Your words, your theme, your celebration.",
      },
      {
        title: "Send the link",
        description: "They live the moment — and their answer finds you.",
      },
    ],
  },
  {
    slug: "date-ask",
    name: "Will You Go Out With Me?",
    eyebrow: "A moment",
    tagline:
      "A warm, playful way to ask someone out — built one beat at a time, with their yes sent right back to you.",
    description:
      "The butterflies of asking someone out, made into a little moment. A short, warm build-up, the question, and — when they say yes — the plan, sealed with their answer on its way to you.",
    icon: "Heart",
    status: "live",
    liveHref: "/date-ask",
    makeHref: "/date-ask/build",
    accent: "from-[#f4768e]/22 via-[#ffb3c1]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 80% 65% at 50% 20%, #fff6f0 0%, #ffe1e6 50%, #f7c5cf 100%)",
    span: "small",
    highlights: [
      {
        icon: "Sparkles",
        title: "A playful build-up",
        description: "Just enough nerve before the ask.",
      },
      {
        icon: "Calendar",
        title: "The plan, sealed",
        description: "When and where appear the moment they say yes.",
      },
      {
        icon: "Gift",
        title: "Their yes comes back",
        description: "You're notified the instant they answer.",
      },
    ],
    steps: [
      {
        title: "Set the mood",
        description: "Pick a theme and a couple of opening lines.",
      },
      {
        title: "Ask the question",
        description: "Add the plan that waits behind a yes.",
      },
      {
        title: "Send the link",
        description: "They feel the build-up — and you get the answer.",
      },
    ],
  },
  {
    slug: "desire-deck",
    name: "Desire Deck",
    eyebrow: "Red Zone · 18+",
    tagline:
      "An adults-only deck of intimate prompt cards — draw one at a time, pick your heat, and spice up the night.",
    description:
      "The pricey romantic card deck, reimagined for the two of you. Write your own prompts, dares, and questions, set a heat for each, then draw them one at a time on a private night in — endlessly customizable, and shared by a link only you two see.",
    icon: "Flame",
    status: "live",
    liveHref: "/desire-deck",
    makeHref: "/desire-deck/build",
    adult: true,
    accent: "from-[#ff4d6d]/22 via-[#c81d4e]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 25%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
    span: "small",
    highlights: [
      {
        icon: "Flame",
        title: "Pick your heat",
        description: "Cards from sweet to wild — you set the intensity.",
      },
      {
        icon: "PenLine",
        title: "Write your own",
        description: "Every card in your words, for the two of you.",
      },
      {
        icon: "Lock",
        title: "Private by design",
        description: "18+ gated and shared by a link only you two hold.",
      },
    ],
    steps: [
      {
        title: "Write your cards",
        description: "Prompts, dares, questions — set a heat for each.",
      },
      {
        title: "Shuffle the deck",
        description: "Stack it the way the night should unfold.",
      },
      {
        title: "Share it privately",
        description: "Send a link and draw cards together.",
      },
    ],
  },
  {
    slug: "desire-matcher",
    name: "Desire Matcher",
    eyebrow: "Red Zone · 18+",
    tagline:
      "You both answer a list privately — only the things you're BOTH into are revealed. No awkward asking, no exposed nos.",
    description:
      "The honest conversation, without the nerve it takes to start it. Curate a list of things you might be into, answer each privately, and share it. Your partner answers too — and you only ever see what you both said yes (or maybe) to. Everything else stays secret.",
    icon: "HeartHandshake",
    status: "live",
    liveHref: "/desire-matcher",
    makeHref: "/desire-matcher/build",
    adult: true,
    accent: "from-[#ff4d6d]/22 via-[#c81d4e]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 25%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
    span: "small",
    highlights: [
      {
        icon: "HeartHandshake",
        title: "Only mutual matches",
        description: "See what you both want — nothing one-sided.",
      },
      {
        icon: "Lock",
        title: "Your nos stay private",
        description: "Neither of you ever sees the other's rejections.",
      },
      {
        icon: "PenLine",
        title: "Your own list",
        description: "Curate the activities, set a heat for each.",
      },
    ],
    steps: [
      {
        title: "Build the list",
        description: "Add activities and answer each one yourself.",
      },
      {
        title: "Share privately",
        description: "Send a link only the two of you hold.",
      },
      {
        title: "See your matches",
        description: "Only what you both want is revealed.",
      },
    ],
  },
  {
    slug: "dice-of-desire",
    name: "Dice of Desire",
    eyebrow: "Red Zone · 18+",
    tagline:
      "An adults-only roll-a-position game — two dice, a 6×6 board, and wherever they land is what's next. No deciding, just luck.",
    description:
      "The printed \"roll a position\" chart, reimagined for the two of you. Reword every square of a 6×6 board, set a heat for each, then roll two dice on a private night in — whatever they land on is the next thing you try. Endlessly customizable, and shared by a link only you two see.",
    icon: "Dices",
    status: "live",
    liveHref: "/dice-of-desire",
    makeHref: "/dice-of-desire/build",
    adult: true,
    accent: "from-[#ff4d6d]/22 via-[#c81d4e]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 25%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
    span: "small",
    highlights: [
      {
        icon: "Dices",
        title: "Let the dice decide",
        description: "Two dice, 36 squares — pure luck of the roll.",
      },
      {
        icon: "PenLine",
        title: "Your own board",
        description: "Reword every square and set its heat.",
      },
      {
        icon: "Lock",
        title: "Private by design",
        description: "18+ gated and shared by a link only you two hold.",
      },
    ],
    steps: [
      {
        title: "Fill the board",
        description: "Name all 36 squares — set a heat for each.",
      },
      {
        title: "Share it privately",
        description: "Send a link only the two of you hold.",
      },
      {
        title: "Roll together",
        description: "Two dice pick the square — do what it says.",
      },
    ],
  },
  {
    slug: "snakes-and-lovers",
    name: "Snakes & Lovers",
    eyebrow: "Red Zone · 18+",
    tagline:
      "An adults-only Snakes & Ladders — a dare on every square, ladders rush you hotter, snakes tease you back, first to 100 directs the finale.",
    description:
      "Snakes & Ladders, reimagined for the two of you. A dare waits on all 100 squares, climbing from sweet warm-ups to a wild climax. Take turns rolling — ladders are a \"Heat Rush\" up to something hotter, snakes are a \"Slow Burn\" that teases you back, and whoever reaches 100 first directs the finale. Reword every square, set its heat, and share it by a link only you two hold.",
    icon: "Dices",
    status: "live",
    liveHref: "/snakes-and-lovers",
    makeHref: "/snakes-and-lovers/build",
    adult: true,
    accent: "from-[#ff4d6d]/22 via-[#c81d4e]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 25%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
    span: "small",
    highlights: [
      {
        icon: "Dices",
        title: "Climb to the climax",
        description: "100 squares, sweet to wild — first to the top wins.",
      },
      {
        icon: "PenLine",
        title: "Your own board",
        description: "Reword every dare and set its heat.",
      },
      {
        icon: "Lock",
        title: "Private by design",
        description: "18+ gated and shared by a link only you two hold.",
      },
    ],
    steps: [
      {
        title: "Fill the board",
        description: "Write a dare on all 100 squares — set a heat for each.",
      },
      {
        title: "Share it privately",
        description: "Send a link only the two of you hold.",
      },
      {
        title: "Climb together",
        description: "Take turns rolling — first to 100 directs the finale.",
      },
    ],
  },
  {
    slug: "love-coupons",
    name: "Love Coupons",
    eyebrow: "Red Zone · 18+",
    tagline:
      "A digital booklet of redeemable coupons — they tap one to cash it in, and you get pinged to make good on it.",
    description:
      "The love-coupon book, reimagined: write your own redeemable coupons — a slow dance, a massage, your choice tonight — set a heat for each, and share the booklet. They open the link, pick one, and tap Redeem; you get a ping to deliver. No expiry, no limits, fully yours.",
    icon: "Ticket",
    status: "live",
    liveHref: "/love-coupons",
    makeHref: "/love-coupons/build",
    adult: true,
    accent: "from-[#ff4d6d]/22 via-[#c81d4e]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 25%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
    span: "small",
    highlights: [
      {
        icon: "Ticket",
        title: "Redeemable coupons",
        description: "They tap to cash one in — you get notified.",
      },
      {
        icon: "PenLine",
        title: "Write your own",
        description: "Any coupon you like, with a heat for each.",
      },
      {
        icon: "Gift",
        title: "Never runs out",
        description: "No expiry, no limits — reuse it forever.",
      },
    ],
    steps: [
      {
        title: "Write the coupons",
        description: "From a slow dance to your wildest one.",
      },
      {
        title: "Share the booklet",
        description: "Send a link only the two of you hold.",
      },
      {
        title: "They cash one in",
        description: "Tap to redeem — and you're pinged to deliver.",
      },
    ],
  },
  {
    slug: "naughty-spins",
    name: "Naughty Spins",
    eyebrow: "Red Zone · 18+",
    tagline:
      "An adults-only spin-the-wheel — give it a spin, land on a category, and do what the card says. Every wedge and prompt is yours.",
    description:
      "The naughty spinner board, reimagined for the two of you. Set your own categories — Action, Deep Talk, Dare, whatever you like — give each a colour and its own stack of prompts, then spin a real, weighted wheel that lands on one and deals a card. Endlessly customizable, and shared by a link only you two hold.",
    icon: "Disc3",
    status: "live",
    liveHref: "/naughty-spins",
    makeHref: "/naughty-spins/build",
    adult: true,
    accent: "from-[#ff4d6d]/22 via-[#c81d4e]/10 to-transparent",
    previewGradient:
      "radial-gradient(ellipse 70% 60% at 50% 25%, #2a0a18 0%, #1a0710 55%, #0d040a 100%)",
    span: "small",
    highlights: [
      {
        icon: "Disc3",
        title: "Spin a real wheel",
        description: "A weighted spin lands on a category and deals a card.",
      },
      {
        icon: "PenLine",
        title: "Your categories",
        description: "Name each wedge, pick its colour, write its prompts.",
      },
      {
        icon: "Lock",
        title: "Private by design",
        description: "18+ gated and shared by a link only you two hold.",
      },
    ],
    steps: [
      {
        title: "Set your wedges",
        description: "Add categories and the prompts inside each one.",
      },
      {
        title: "Give it a spin",
        description: "The wheel lands on a category and deals a card.",
      },
      {
        title: "Share it privately",
        description: "Send a link and spin the night away together.",
      },
    ],
  },
];

/** The live experiences featured on the landing bento, in display order.
 *  Adults-only (Red Zone) experiences are kept off the main bento. */
export const featuredExperiences = experiences.filter(
  (e) => e.status === "live" && !e.adult,
);

/** Adults-only experiences, for the dedicated 18+ "Red Zone" section. */
export const redZoneExperiences = experiences.filter((e) => e.adult);

export function getExperience(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}

export function getLiveExperienceSlugs(): string[] {
  return experiences.filter((e) => e.status === "live").map((e) => e.slug);
}

/** Product (marketing) page route for an experience. */
export function experienceHref(slug: string): string {
  return `/experiences/${slug}`;
}
