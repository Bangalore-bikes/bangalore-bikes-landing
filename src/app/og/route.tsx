import { ImageResponse } from "next/og";

import { siteOrigin } from "@/lib/siteMetadata";

export const runtime = "edge";

const MAX_TITLE = 110;
const MAX_SUBTITLE = 150;

function clamp(value: string | null, limit: number): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return text.slice(0, limit - 1).trimEnd() + "…";
}

/**
 * One social card for every long-form page. Generated at request time so a
 * title edit changes the card without a rebuild, and cached by the CDN.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const title = clamp(url.searchParams.get("title"), MAX_TITLE) || "Bangalore Bikes";
  const subtitle = clamp(url.searchParams.get("subtitle"), MAX_SUBTITLE);
  const kind = clamp(url.searchParams.get("kind"), 24) || "Community";
  const host = new URL(siteOrigin).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0d0f",
          backgroundImage:
            "radial-gradient(circle at 82% 18%, rgba(249,115,22,0.38), transparent 42%), radial-gradient(circle at 8% 92%, rgba(56,189,248,0.22), transparent 46%)",
          padding: "64px 72px",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "#f97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "#0c0d0f",
            }}
          >
            B
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#cbd5f5",
            }}
          >
            <span>Bangalore Bikes</span>
            <span style={{ fontSize: 16, letterSpacing: 3, color: "#94a3b8" }}>
              {kind}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              fontSize: title.length > 70 ? 58 : 72,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 27,
                lineHeight: 1.4,
                color: "#cbd5e1",
                maxWidth: 940,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#94a3b8",
            borderTop: "1px solid rgba(148,163,184,0.3)",
            paddingTop: 26,
          }}
        >
          <span>{host}</span>
          <span>Bengaluru · Karnataka</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "cache-control": "public, max-age=0, s-maxage=31536000, immutable",
      },
    },
  );
}
