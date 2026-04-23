/**
 * Products API 客户端
 * -------------------
 * 设计目标：用户提交写操作后，列表/详情立即反映最新数据，无需手动刷新或等待 CDN 过期。
 *
 * 机制（主流「版本化 URL」方案）：
 * 1. Worker 维护一个 `products_version`，任何写操作都会自增。
 * 2. 前端读接口永远带上 `?v=<version>`；版本变 → URL 变 → 新缓存键 → 旧缓存自动作废。
 * 3. 写操作完成后，调用 `invalidateProducts()`：拉最新 version → 更新内存缓存 →
 *    让 TanStack Query 的 queryKey 变化 → 自动 refetch 最新数据。
 */

import type { QueryClient } from "@tanstack/react-query";

export const API_BASE_URL = "https://img.mono-grp.com";

let cachedVersion: string | null = null;
let inflightVersionFetch: Promise<string> | null = null;

async function fetchVersion(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/products/version`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`version fetch failed: ${res.status}`);
  const data = (await res.json()) as { version: string };
  return data.version;
}

/** 读取当前版本号（带内存缓存与并发去重）。*/
export async function getProductsVersion(force = false): Promise<string> {
  if (!force && cachedVersion) return cachedVersion;
  if (inflightVersionFetch) return inflightVersionFetch;
  inflightVersionFetch = fetchVersion()
    .then((v) => {
      cachedVersion = v;
      return v;
    })
    .finally(() => {
      inflightVersionFetch = null;
    });
  return inflightVersionFetch;
}

/**
 * 写操作后调用：强制刷新 version，并让 React Query 丢弃所有 products 相关缓存。
 * UI 侧的 queryKey 会因 version 变化而变化，自动触发 refetch。
 */
export async function invalidateProducts(queryClient: QueryClient): Promise<void> {
  await getProductsVersion(true);
  await queryClient.invalidateQueries({ queryKey: ["products"] });
  await queryClient.invalidateQueries({ queryKey: ["product"] });
}

/** 给任意 URL 追加 `v=<version>`，用于所有读接口。*/
export async function withVersion(url: string): Promise<string> {
  const version = await getProductsVersion();
  const u = new URL(url, API_BASE_URL);
  u.searchParams.set("v", version);
  return u.toString();
}
