"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ShortenResponse = {
  shortUrl?: string;
  longUrl?: string;
  error?: string;
};

export default function UrlShortenerForm() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setShortUrl(null);
    setCopied(false);

    const trimmed = longUrl.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/data/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl: trimmed }),
      });
      const data = (await res.json()) as ShortenResponse;
      if (!res.ok || !data.shortUrl) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      setShortUrl(`${origin}/${data.shortUrl}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="url"
          inputMode="url"
          placeholder="https://example.com/very/long/url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          aria-invalid={error ? true : undefined}
          required
          className="h-11 flex-1"
          disabled={loading}
        />
        <Button type="submit" size="lg" disabled={loading} className="h-11">
          {loading ? "Shortening..." : "Shorten"}
        </Button>
      </form>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {shortUrl && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Your short URL
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-base font-medium text-foreground underline-offset-4 hover:underline"
            >
              {shortUrl}
            </a>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
