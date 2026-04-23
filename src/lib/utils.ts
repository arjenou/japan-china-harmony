import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** CDN / R2 keys may contain `%`, `/`, CJK — encode each segment so URLs are valid (avoids Cloudflare 400). */
export function cdnImageUrl(imageBaseUrl: string, objectKey: string): string {
  if (!objectKey) return "";
  const path = objectKey.split("/").map(encodeURIComponent).join("/");
  const base = imageBaseUrl.replace(/\/$/, "");
  return `${base}/api/images/${path}`;
}
