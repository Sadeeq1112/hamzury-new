import { NextResponse } from "next/server";
import { blobAccess, blobClientUploadEnabled, blobEnabled } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    blob: blobEnabled(),
    clientUpload: blobClientUploadEnabled(),
    access: blobAccess()
  });
}
