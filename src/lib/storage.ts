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
 * Netlify's automatic Blobs context isn't reliably forwarded into Next.js
 * route handlers compiled by the Netlify Next.js runtime, so we configure
 * the store explicitly with a site ID + API token when they're set
 * (NETLIFY_SITE_ID / NETLIFY_BLOBS_TOKEN), falling back to zero-config
 * auto-detection otherwise.
 */
export function getUploadsStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: "uploads", siteID, token });
  }
  return getStore("uploads");
}

/**
 * In production (Netlify), local disk doesn't persist between requests/
 * deploys, so uploads go to Netlify Blobs and are served back via
 * /api/uploads/[key]. In local dev, we fall back to public/uploads on disk.
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

  if (process.env.NODE_ENV === "production") {
    const store = getUploadsStore();
    await store.set(filename, arrayBuffer, { metadata: { contentType: file.type } });
    return `/api/uploads/${filename}`;
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(arrayBuffer));
  return `/uploads/${filename}`;
}
