import { NextResponse, type NextRequest } from "next/server";
import { findByShortUrl } from "@/lib/urls";
import { isValidShortUrl } from "@/lib/base62";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ shortUrl: string }> },
) {
  const { shortUrl } = await ctx.params;

  if (!isValidShortUrl(shortUrl)) {
    return NextResponse.json(
      { error: "Invalid short URL." },
      { status: 404 },
    );
  }

  const record = await findByShortUrl(shortUrl);
  if (!record) {
    return NextResponse.json(
      { error: "Short URL not found." },
      { status: 404 },
    );
  }

  // 301 = permanent; browsers cache the redirect and bypass us on repeats.
  // Swap to 302 if you want every click to flow through analytics.
  return NextResponse.redirect(record.longUrl, 301);
}
