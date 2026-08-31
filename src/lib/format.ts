export function when(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(dt);
}

export function money(n: number | null | undefined) {
  if (n == null) return "—";
  return "₦" + n.toLocaleString("en-NG");
}
