import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "receipts");

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf"
};

export const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

export function extensionFor(mime: string) {
  return ALLOWED[mime] || null;
}

export async function saveReceipt(ref: string, file: File) {
  const mime = file.type;
  const ext = extensionFor(mime);
  if (!ext) throw new Error("Send a photo (JPG, PNG, WEBP) or a PDF.");
  if (file.size > MAX_RECEIPT_BYTES) throw new Error("That file is larger than 8 MB.");

  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(UPLOAD_ROOT, ref.replace(/[^A-Z0-9-]/gi, ""));
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const abs = path.join(dir, name);
  await writeFile(abs, buf);
  return {
    abs,
    rel: path.join(ref.replace(/[^A-Z0-9-]/gi, ""), name),
    mime,
    original: file.name || name
  };
}

export function resolveReceipt(rel: string) {
  const abs = path.join(UPLOAD_ROOT, rel);
  const root = path.resolve(UPLOAD_ROOT);
  if (!path.resolve(abs).startsWith(root)) throw new Error("Invalid path");
  return abs;
}

export async function readReceipt(rel: string) {
  return readFile(resolveReceipt(rel));
}

export async function removeReceipt(rel?: string | null) {
  if (!rel) return;
  try {
    await unlink(resolveReceipt(rel));
  } catch {
    /* already gone */
  }
}
