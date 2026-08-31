import { randomBytes } from "crypto";
import { prisma } from "./db";

export function makeRef() {
  const year = new Date().getFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase().slice(0, 5);
  return `HMZ-${year}-${suffix}`;
}

export async function uniqueRef() {
  for (let i = 0; i < 8; i++) {
    const ref = makeRef();
    const exists = await prisma.application.findUnique({ where: { ref }, select: { id: true } });
    if (!exists) return ref;
  }
  throw new Error("Could not allocate a reference");
}

export function isRef(value: string) {
  return /^HMZ-\d{4}-[A-Z0-9]{5}$/i.test(value.trim());
}
