/**
 * Our Places — content & art-direction config.
 *
 * This is the whole gift. Everything personal lives here; the map, pins, and
 * story cards read from it and know nothing else about the relationship. Rewrite
 * the places in your own voice before gifting — nothing else in the feature
 * needs to change.
 *
 * Author `PLACES` in chronological order: the pins fade in one-by-one in array
 * order, so the map draws the story the way it happened. Six honest places beat
 * twenty surface-level ones — aim for 6–15.
 */

export type PlaceCategory =
  | "first" // firsts — first date, first trip, first kiss
  | "trip" // travel and getaways
  | "everyday" // ordinary places that became extraordinary (your café, her street)
  | "milestone" // anniversaries, proposals, big moments
  | "hidden"; // places only the two of you know about

export type PlaceMood =
  | "warm" // golden, romantic — dinners, sunsets, tender moments
  | "joyful" // bright, celebratory — trips, laughing, adventures
  | "quiet" // soft, intimate — walks, late nights, quiet conversations
  | "electric"; // exciting, nervous energy — first times, surprises

export type Place = {
  /** Stable id — also used as the React key and the sidebar anchor. */
  id: string;
  /** Short location name shown on the pin label. */
  name: string;
  /** City name for display on the card. */
  city: string;
  country: string;
  /** Decimal latitude / longitude. */
  lat: number;
  lng: number;
  /** However you remember it — "March 2023" or "14 Feb 2022". */
  date: string;
  category: PlaceCategory;
  /** Path to an image under /public, e.g. "/our-places/first-date.jpg". */
  photo?: string;
  /** Headline of the memory — 4–8 words, emotional. */
  title: string;
  /** The actual memory. 2–5 sentences. Write it like a letter to her. */
  memory: string;
  /** Controls the pin colour. */
  mood: PlaceMood;
};

export type TileStyle = {
  url: string;
  attribution: string;
  /** Subdomains the {s} placeholder cycles through. */
  subdomains?: string;
  minZoom: number;
  maxZoom: number;
};

export type MapConfig = {
  title: string;
  subtitle: string;
  /** Geographic centre of the story — where the map settles on load. */
  centerLat: number;
  centerLng: number;
  /** Zoom out enough to see several pins on load. */
  defaultZoom: number;
  /** The base map tiles. See TILE_STYLES for ready-made options. */
  tiles: TileStyle;
};

/**
 * Ready-made base maps. All are free and need no API key, so the gift never
 * breaks on a billing wall.
 *
 * NOTE: the classic Stamen Watercolor tiles were retired in 2023 (they moved to
 * Stadia Maps and now require an account + key), so they are intentionally not
 * offered here. CartoDB Positron, warmed with a CSS filter, gives the painterly,
 * romantic feel without a key.
 */
export const TILE_STYLES = {
  /** Clean, minimal, light — warmed toward cream by `our-places.css`. */
  positron: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    subdomains: "abcd",
    minZoom: 3,
    maxZoom: 19,
  },
  /** Softer, more illustrated streets — a gentle alternative. */
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    subdomains: "abcd",
    minZoom: 3,
    maxZoom: 19,
  },
} satisfies Record<string, TileStyle>;

export const MAP_CONFIG: MapConfig = {
  // ↓ Make it hers.
  title: "Our Places",
  subtitle: "every place that is part of us",
  centerLat: 20.5937,
  centerLng: 78.9629,
  defaultZoom: 5,
  tiles: TILE_STYLES.positron,
};

export const PLACES: Place[] = [
  {
    id: "first-date",
    name: "The Leela Café",
    city: "Bengaluru",
    country: "India",
    lat: 12.9716,
    lng: 77.5946,
    date: "October 2022",
    category: "first",
    title: "Where it all began",
    memory:
      "You were twenty minutes late and I was convinced you weren't coming. Then you walked in apologising for the traffic, slightly out of breath, and I forgot to be annoyed. We talked until they turned the chairs up on the tables and someone politely asked us to leave.",
    mood: "electric",
  },
  {
    id: "first-trip",
    name: "Palolem Beach",
    city: "Goa",
    country: "India",
    lat: 15.01,
    lng: 74.0232,
    date: "December 2022",
    category: "trip",
    title: "Our first trip together",
    memory:
      "Cold mornings, terrible coffee, a plan we abandoned by the second day. You stole my fries every single meal and acted shocked when I noticed. It's still the most at-home I've ever felt being nowhere in particular.",
    mood: "joyful",
  },
  {
    id: "our-cafe",
    name: "The corner table",
    city: "Bengaluru",
    country: "India",
    lat: 12.9352,
    lng: 77.6245,
    date: "every other Sunday",
    category: "everyday",
    title: "The ordinary place that became ours",
    memory:
      "Nothing ever happened here, which is exactly the point. Same corner table, same order, the same argument about who finishes the last bite. A hundred unremarkable Sundays that I'd trade nothing for.",
    mood: "warm",
  },
  {
    id: "the-hard-week",
    name: "Marine Drive",
    city: "Mumbai",
    country: "India",
    lat: 18.9433,
    lng: 72.8235,
    date: "mid 2023",
    category: "hidden",
    title: "The walk that fixed it",
    memory:
      "We were both wrong and both too tired to say it. We walked the whole curve of the sea wall in silence until you reached for my hand before either of us had apologised. That told me everything I needed to know about us.",
    mood: "quiet",
  },
  {
    id: "your-birthday",
    name: "The rooftop",
    city: "Udaipur",
    country: "India",
    lat: 24.5854,
    lng: 73.7125,
    date: "your birthday, 2023",
    category: "milestone",
    title: "You said no fuss",
    memory:
      "You kept insisting you didn't want a fuss, then smiled the whole way through the fuss. I'd ruin a hundred surprises just to watch you try, and fail, not to cry over a cake again.",
    mood: "warm",
  },
  {
    id: "someday",
    name: "Kyoto",
    city: "Kyoto",
    country: "Japan",
    lat: 35.0116,
    lng: 135.7681,
    date: "someday soon",
    category: "trip",
    title: "The one we haven't taken yet",
    memory:
      "We've talked about this one so many times it almost feels like a memory already. Cherry blossoms, too many trains, getting wonderfully lost. Consider this pin a promise — I'm not done filling this map.",
    mood: "joyful",
  },
];

/** Pin colours by mood — tuned to sit inside the warm Kyndl palette. */
export const MOOD_COLORS: Record<PlaceMood, string> = {
  warm: "#E8A050", // golden amber
  joyful: "#FF7A59", // kyndl coral
  quiet: "#AFA9EC", // soft violet
  electric: "#F2596F", // kyndl rose
};

/** Lucide icon name + badge colours for each category. */
export const CATEGORY_META: Record<
  PlaceCategory,
  { label: string; icon: string; badgeBg: string; badgeText: string }
> = {
  first: {
    label: "A first",
    icon: "Sparkles",
    badgeBg: "#FBD9CE",
    badgeText: "#72243E",
  },
  trip: {
    label: "A trip",
    icon: "Plane",
    badgeBg: "#D9EFE6",
    badgeText: "#1F5F4E",
  },
  everyday: {
    label: "Everyday",
    icon: "Coffee",
    badgeBg: "#FAE3C4",
    badgeText: "#633806",
  },
  milestone: {
    label: "A milestone",
    icon: "PartyPopper",
    badgeBg: "#E6E0FB",
    badgeText: "#3A2A5C",
  },
  hidden: {
    label: "Just ours",
    icon: "EyeOff",
    badgeBg: "#EAE6DC",
    badgeText: "#3A2A25",
  },
};
