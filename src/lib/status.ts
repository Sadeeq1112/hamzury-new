export function pill(status: string) {
  if (status === "VERIFIED") return "pill ok";
  if (status === "REJECTED") return "pill bad";
  return "pill warn";
}

export function label(status: string) {
  if (status === "VERIFIED") return "Verified";
  if (status === "REJECTED") return "Rejected";
  return "Pending";
}
