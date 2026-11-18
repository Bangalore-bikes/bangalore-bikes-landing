import { siteOrigin } from "../siteMetadata.ts";

/**
 * The IndexNow key is a public proof-of-control file served from the site, not
 * a credential. It is committed at `public/<key>.txt` so every deployment can
 * answer the verification request.
 */
export const INDEXNOW_KEY = "173d06430897a413106a39f18a714c88";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

/** Only same-host, absolute URLs are submitted; a malformed list is rejected. */
export function indexNowPayload(
  urls: string[],
  options: { origin?: string; key?: string } = {},
): IndexNowPayload | null {
  const origin = (options.origin ?? siteOrigin).replace(/\/+$/, "");
  const key = options.key ?? INDEXNOW_KEY;
  const host = new URL(origin).host;

  const urlList = [...new Set(urls)]
    .map((url) => url.trim())
    .filter((url) => {
      try {
        return new URL(url).host === host;
      } catch {
        return false;
      }
    });

  if (urlList.length === 0) return null;
  return {
    host,
    key,
    keyLocation: `${origin}/${key}.txt`,
    urlList,
  };
}

/**
 * Tells search engines a URL changed. Fire-and-forget by design: a failed ping
 * must never fail a publish, and the sitemap still covers discovery.
 */
export async function submitUrls(
  urls: string[],
  options: { origin?: string; fetchImpl?: typeof fetch } = {},
): Promise<boolean> {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }
  if (process.env.NODE_ENV !== "production") return false;

  const payload = indexNowPayload(urls, { origin: options.origin });
  if (!payload) return false;

  try {
    const response = await (options.fetchImpl ?? fetch)(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok && response.status !== 202) {
      console.error("IndexNow rejected the submission", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "IndexNow submission failed",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}
