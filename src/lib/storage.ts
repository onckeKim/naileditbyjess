import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getStore } from "@netlify/blobs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

function extensionFor(mimeType: string) {
  const subtype = mimeType.split("/")[1];
  return subtype === "jpeg" ? "jpg" : subtype;
}

/**
 * Neither Netlify's automatic Blobs context nor NODE_ENV is reliably
 * forwarded into Next.js route handlers compiled by the Netlify Next.js
 * runtime, so storage mode is switched explicitly via env vars we set
 * ourselves (NETLIFY_SITE_ID / NETLIFY_BLOBS_TOKEN), which are known to
 * come through correctly (same mechanism as DATABASE_URL).
 */
const siteID = process.env.NETLIFY_SITE_ID;
const blobsToken = process.env.NETLIFY_BLOBS_TOKEN;
const useBlobs = Boolean(siteID && blobsToken);

export function getUploadsStore() {
  if (siteID && blobsToken) {
    return getStore({ name: "uploads", siteID, token: blobsToken });
  }
  return getStore("uploads");
}

/**
 * On Netlify, local disk doesn't persist between requests/deploys, so
 * uploads go to Netlify Blobs (when NETLIFY_SITE_ID + NETLIFY_BLOBS_TOKEN
 * are set) and are served back via /api/uploads/[key]. Otherwise (local
 * dev), we fall back to public/uploads on disk.
 */
export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Please upload a JPEG, PNG, WEBP, or GIF image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large. Maximum size is 8MB.");
  }

  const filename = `${randomUUID()}.${extensionFor(file.type)}`;
  const arrayBuffer = await file.arrayBuffer();

  if (useBlobs) {
    const store = getUploadsStore();
    await store.set(filename, arrayBuffer, { metadata: { contentType: file.type } });
    return `/api/uploads/${filename}`;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(arrayBuffer));
  return `/uploads/${filename}`;
}
