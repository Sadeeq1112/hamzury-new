import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { PaymentType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { upsertReceipt } from "@/lib/receipts";
import { APPLICATION_FEE } from "@/lib/catalog";
import {
  saveReceipt,
  blobClientUploadEnabled,
  blobToken,
  isBlobUrl,
  ALLOWED_RECEIPT_TYPES,
  MAX_RECEIPT_BYTES
} from "@/lib/uploads";

export const runtime = "nodejs";
export const maxDuration = 60;

function asPaymentType(value: unknown): PaymentType | null {
  if (value === "APPLICATION_FEE" || value === "PROGRAMME_FEE") return value;
  return null;
}

async function loadApp(ref: string) {
  return prisma.application.findUnique({
    where: { ref },
    include: { payments: true }
  });
}

function requireAppFeeFirst(
  app: NonNullable<Awaited<ReturnType<typeof loadApp>>>,
  type: PaymentType
) {
  if (type !== "PROGRAMME_FEE") return;
  const appFee = app.payments.find((p) => p.type === "APPLICATION_FEE");
  if (!appFee?.receiptPath) {
    throw new Error("Upload your application-fee receipt first.");
  }
}

function parseTokenMeta(raw?: string | null) {
  let paymentType: PaymentType = "APPLICATION_FEE";
  let originalName = "receipt";
  try {
    const extra = JSON.parse(raw || "{}") as { paymentType?: string; originalName?: string };
    const t = asPaymentType(extra.paymentType);
    if (t) paymentType = t;
    if (extra.originalName) originalName = extra.originalName;
  } catch {
    /* defaults */
  }
  return { paymentType, originalName };
}

async function attach(opts: {
  ref: string;
  type: PaymentType;
  receiptPath: string;
  receiptName: string;
  receiptMime: string;
}) {
  const app = await loadApp(opts.ref);
  if (!app) throw new Error("We do not have that reference.");
  requireAppFeeFirst(app, opts.type);
  const amount = opts.type === "APPLICATION_FEE" ? APPLICATION_FEE : app.programmeFee ?? 0;
  const existing = app.payments.find((p) => p.type === opts.type);
  if (existing?.receiptPath === opts.receiptPath) return existing;
  return upsertReceipt({
    applicationId: app.id,
    type: opts.type,
    amount,
    receiptPath: opts.receiptPath,
    receiptName: opts.receiptName,
    receiptMime: opts.receiptMime,
    existing: existing ? { id: existing.id, receiptPath: existing.receiptPath } : null
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref: raw } = await params;
  const ref = raw.trim().toUpperCase();
  const app = await loadApp(ref);
  if (!app) return NextResponse.json({ error: "We do not have that reference." }, { status: 404 });

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
    }

    if (body.type === "blob.generate-client-token" || body.type === "blob.upload-completed") {
      const token = blobToken();
      if (!blobClientUploadEnabled() || !token) {
        return NextResponse.json(
          {
            error:
              "Blob client uploads need BLOB_READ_WRITE_TOKEN (OIDC is not enough for browser uploads)."
          },
          { status: 400 }
        );
      }
      try {
        const json = await handleUpload({
          body: body as unknown as HandleUploadBody,
          request: req,
          token,
          onBeforeGenerateToken: async (_pathname, clientPayload) => {
            const meta = parseTokenMeta(clientPayload);
            requireAppFeeFirst(app, meta.paymentType);
            return {
              allowedContentTypes: ALLOWED_RECEIPT_TYPES,
              maximumSizeInBytes: MAX_RECEIPT_BYTES,
              addRandomSuffix: true,
              tokenPayload: JSON.stringify({ ref, ...meta })
            };
          },
          onUploadCompleted: async ({ blob, tokenPayload }) => {
            const extra = parseTokenMeta(tokenPayload);
            await attach({
              ref,
              type: extra.paymentType,
              receiptPath: blob.url,
              receiptName: extra.originalName,
              receiptMime: blob.contentType || "application/octet-stream"
            });
          }
        });
        return NextResponse.json(json);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Could not store that file.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    if (body.action === "attach") {
      const type = asPaymentType(body.paymentType);
      const url = typeof body.url === "string" ? body.url : "";
      const haystack = decodeURIComponent(url).toUpperCase();
      if (!type || !isBlobUrl(url) || !haystack.includes(ref)) {
        return NextResponse.json({ error: "Invalid receipt." }, { status: 400 });
      }
      try {
        const payment = await attach({
          ref,
          type,
          receiptPath: url,
          receiptName: typeof body.name === "string" ? body.name : "receipt",
          receiptMime: typeof body.contentType === "string" ? body.contentType : "application/octet-stream"
        });
        return NextResponse.json({ ok: true, paymentId: payment.id, type: payment.type });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Could not store that file.";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Unknown request." }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Upload the receipt as a file." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a receipt to upload." }, { status: 400 });
  }

  const type = asPaymentType(form.get("type") || "APPLICATION_FEE");
  if (!type) {
    return NextResponse.json({ error: "Unknown payment type." }, { status: 400 });
  }

  try {
    requireAppFeeFirst(app, type);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not store that file." },
      { status: 400 }
    );
  }

  let saved;
  try {
    saved = await saveReceipt(ref, file);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not store that file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const payment = await attach({
      ref,
      type,
      receiptPath: saved.rel,
      receiptName: saved.original,
      receiptMime: saved.mime
    });
    return NextResponse.json(
      { ok: true, paymentId: payment.id, type: payment.type },
      { status: app.payments.find((p) => p.type === type) ? 200 : 201 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not store that file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
