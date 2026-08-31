export const APPLICATION_FEE = 5000;

export const BANK = {
  bank: "Moniepoint",
  name: "Hamzury Mainstream Ltd",
  acct: "82025158500"
};

export const WHATSAPP = "08067149356";

export const ROUTES = ["junior", "ceo", "founder", "ecosystem", "siwes"] as const;
export type RouteId = (typeof ROUTES)[number];

export const TRACKS = [
  { id: "data", name: "AI Data & Insight Analyst", price: 64000 },
  { id: "automation", name: "AI Automation Agency", price: 64000 },
  { id: "assistant", name: "AI Executive Assistant", price: 59000 },
  { id: "brand", name: "AI Brand & Positioning", price: 59000 },
  { id: "revenue", name: "AI Revenue & Systems Closer", price: 64000 },
  { id: "startup", name: "AI Startup Architect", price: 64000 },
  { id: "agentic", name: "Agentic AI Engineer", price: 69000 },
  { id: "media", name: "AI Media & Faceless Agency", price: 59000 },
  { id: "industry", name: "Industry AI Transformer", price: 64000 },
  { id: "wealth", name: "AI Wealth & Compliance", price: 59000 },
  { id: "web", name: "Website Design & Development", price: 56000 },
  { id: "software", name: "Software & App Development", price: 56000 }
] as const;

export const TRACK_IDS = TRACKS.map((t) => t.id);
export type TrackId = (typeof TRACK_IDS)[number];

export const SIWES_OPTIONS: Record<string, { label: string; amount: number }> = {
  "1": { label: "SIWES · 1 month", amount: 30000 },
  "2": { label: "SIWES · 2 months", amount: 50000 },
  "3": { label: "SIWES · 3 months", amount: 70000 },
  intern: { label: "Direct internship · per month", amount: 70000 }
};

export const ROUTE_LABELS: Record<RouteId, string> = {
  junior: "Junior Innovator",
  ceo: "Innovator → CEO",
  founder: "CEO → Founder",
  ecosystem: "Founder → Ecosystem",
  siwes: "SIWES / Internship"
};

export function trackById(id?: string | null) {
  if (!id) return null;
  return TRACKS.find((t) => t.id === id) ?? null;
}

export function programmeFor(route: string, track?: string | null, siwes?: string | null) {
  if (route === "junior") {
    if (track === "hardware") return { label: "Robotics", amount: 120000 };
    if (track === "software") return { label: "Software", amount: 30000 };
    return { label: "Programme fee", amount: null as number | null };
  }
  if (route === "siwes") {
    const opt = siwes ? SIWES_OPTIONS[siwes] : null;
    return opt
      ? { label: opt.label, amount: opt.amount }
      : { label: "Placement fee", amount: null as number | null };
  }
  if (route === "founder") return { label: "CEO → Founder", amount: 100000 };
  if (route === "ecosystem") return { label: "Founder → Ecosystem", amount: 200000 };
  const t = trackById(track);
  return t
    ? { label: t.name, amount: t.price }
    : { label: "Programme fee", amount: null as number | null };
}

export function naira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}
