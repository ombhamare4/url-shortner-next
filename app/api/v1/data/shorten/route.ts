import { NextResponse } from "next/server";
import { createShortUrl } from "@/lib/urls";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const longUrlRaw =
    body && typeof body === "object" && "longUrl" in body
      ? (body as { longUrl: unknown }).longUrl
      : undefined;
  const longUrl =
    typeof longUrlRaw === "string" ? longUrlRaw.trim() : "";

  if (!longUrl) {
    return NextResponse.json(
      { error: "Missing required parameter: longUrl." },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(longUrl);
  } catch {
    return NextResponse.json(
      { error: "longUrl is not a valid URL." },
      { status: 400 },
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json(
      { error: "Only http and https URLs are supported." },
      { status: 400 },
    );
  }

  try {
    const record = await createShortUrl(longUrl);
    return NextResponse.json({
      shortUrl: record.shortUrl,
      longUrl: record.longUrl,
    });
  } catch (err) {
    console.error("shorten failed", err);
    return NextResponse.json(
      { error: "Failed to shorten URL." },
      { status: 500 },
    );
  }
}
