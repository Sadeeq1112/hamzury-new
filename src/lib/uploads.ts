import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { put, del, get } from "@vercel/blob";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "receipts");

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf"
};

export const ALLOWED_RECEIPT_TYPES = Object.keys(ALLOWED);
export const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

export type SavedReceipt = {
  rel: string;
  mime: string;
  original: string;
};

export function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || process.env.VERCEL === "1";
}

export function isRemoteReceipt(rel: string) {
  return rel.startsWith("http://") || rel.startsWith("https://");
}

export function isBlobUrl(url: string) {
  try {
    return new URL(url).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function extensionFor(mime: string) {
  return ALLOWED[mime] || null;
}

function safeRef(ref: string) {
  return ref.replace(/[^A-Z0-9-]/gi, "");
}

function fileName(ext: string) {
  return `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
}

export async function saveReceipt(ref: string, file: File): Promise<SavedReceipt> {
  const mime = file.type;
  const ext = extensionFor(mime);
  if (!ext) throw new Error("Send a photo (JPG, PNG, WEBP) or a PDF.");
  if (file.size > MAX_RECEIPT_BYTES) throw new Error("That file is larger than 8 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  return storeReceipt(ref, buf, mime, file.name || `receipt.${ext}`);
}

export async function storeReceipt(
  ref: string,
  buf: Buffer,
  mime: string,
  original: string
): Promise<SavedReceipt> {
  const ext = extensionFor(mime);
  if (!ext) throw new Error("Send a photo (JPG, PNG, WEBP) or a PDF.");
  if (buf.length > MAX_RECEIPT_BYTES) throw new Error("That file is larger than 8 MB.");

  const folder = safeRef(ref);
  const name = fileName(ext);

  if (blobEnabled()) {
    const blob = await put(`receipts/${folder}/${name}`, buf, {
      access: "private",
      addRandomSuffix: false,
      contentType: mime
    });
    return { rel: blob.url, mime, original: original || name };
  }

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return { rel: path.join(folder, name), mime, original: original || name };
}

export function resolveReceipt(rel: string) {
  const abs = path.join(UPLOAD_ROOT, rel);
  const root = path.resolve(UPLOAD_ROOT);
  if (!path.resolve(abs).startsWith(root)) throw new Error("Invalid path");
  return abs;
}

export async function readReceipt(rel: string): Promise<{
  body: Buffer | ReadableStream<Uint8Array>;
  contentType?: string;
}> {
  if (isRemoteReceipt(rel)) {
    const result = await get(rel, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new Error("The file is missing.");
    }
    return { body: result.stream, contentType: result.blob.contentType };
  }
  return { body: await readFile(resolveReceipt(rel)) };
}

export async function removeReceipt(rel?: string | null) {
  if (!rel) return;
  try {
    if (isRemoteReceipt(rel)) {
      await del(rel);
      return;
    }
    await unlink(resolveReceipt(rel));
  } catch {
    /* already gone */
  }
}
