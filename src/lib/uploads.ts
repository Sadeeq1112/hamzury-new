import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { put, del, get } from "@vercel/blob";

export const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "receipts");

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf"
};

export const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
export const MAX_RECEIPT_BYTES = 8 * 1024 * 1024;

export type BlobAccess = "public" | "private";

export type SavedReceipt = {
  rel: string;
  mime: string;
  original: string;
};

export function blobToken() {
  const t = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return t || undefined;
}

export function blobEnabled() {
  return Boolean(blobToken()) || process.env.VERCEL === "1";
}

/** handleUpload cannot use OIDC — it needs the static read-write token. */
export function blobClientUploadEnabled() {
  return Boolean(blobToken());
}

export function blobAccess(): BlobAccess {
  const v = process.env.BLOB_ACCESS?.trim().toLowerCase();
  if (v === "public" || v === "private") return v;
  return "private";
}

export function blobAuth() {
  const token = blobToken();
  return token ? { token } : {};
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

export function accessFromUrl(url: string): BlobAccess {
  try {
    const host = new URL(url).hostname;
    if (host.includes(".public.")) return "public";
    if (host.includes(".private.")) return "private";
  } catch {
    /* fall through */
  }
  return blobAccess();
}

export function extensionFor(mime: string) {
  return ALLOWED[mime.toLowerCase()] || null;
}

export function mimeFromFile(file: File) {
  const t = (file.type || "").toLowerCase();
  if (ALLOWED[t]) return t === "image/jpg" ? "image/jpeg" : t;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "pdf") return "application/pdf";
  return t;
}

function safeRef(ref: string) {
  return ref.replace(/[^A-Z0-9-]/gi, "");
}

function fileName(ext: string) {
  return `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
}

function isAccessMismatch(err: unknown) {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  if (/token|credential|unauthor/i.test(msg) && !/access/.test(msg)) return false;
  return /access|public store|private store|not a private|not a public/.test(msg);
}

async function putReceipt(pathname: string, buf: Buffer, mime: string) {
  const preferred = blobAccess();
  const order: BlobAccess[] = preferred === "private" ? ["private", "public"] : ["public", "private"];
  let last: unknown;
  for (const access of order) {
    try {
      return await put(pathname, buf, {
        access,
        addRandomSuffix: false,
        contentType: mime,
        ...blobAuth()
      });
    } catch (err) {
      last = err;
      if (!isAccessMismatch(err)) throw err;
    }
  }
  throw last instanceof Error ? last : new Error("Could not store that file.");
}

export async function saveReceipt(ref: string, file: File): Promise<SavedReceipt> {
  const mime = mimeFromFile(file);
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
  const normalized = mime === "image/jpg" ? "image/jpeg" : mime;
  const ext = extensionFor(normalized);
  if (!ext) throw new Error("Send a photo (JPG, PNG, WEBP) or a PDF.");
  if (buf.length > MAX_RECEIPT_BYTES) throw new Error("That file is larger than 8 MB.");

  const folder = safeRef(ref);
  const name = fileName(ext);

  if (blobEnabled()) {
    const blob = await putReceipt(`receipts/${folder}/${name}`, buf, normalized);
    return { rel: blob.url, mime: normalized, original: original || name };
  }

  const dir = path.join(UPLOAD_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return { rel: path.join(folder, name), mime: normalized, original: original || name };
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
    const result = await get(rel, { access: accessFromUrl(rel), ...blobAuth() });
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
      await del(rel, blobAuth());
      return;
    }
    await unlink(resolveReceipt(rel));
  } catch {
    /* already gone */
  }
}
