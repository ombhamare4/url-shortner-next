import "server-only";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { idToShortCode } from "./shortcode";

const TABLE = "urls";

export type UrlRecord = {
  id: number;
  shortUrl: string;
  longUrl: string;
  createdAt: string;
};

type UrlRow = {
  id: number;
  short_url: string;
  long_url: string;
  created_at: string;
};

const toRecord = (row: UrlRow): UrlRecord => ({
  id: row.id,
  shortUrl: row.short_url,
  longUrl: row.long_url,
  createdAt: row.created_at,
});

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function findByLongUrl(
  longUrl: string,
): Promise<UrlRecord | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, short_url, long_url, created_at")
    .eq("long_url", longUrl)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? toRecord(data as UrlRow) : null;
}

export async function findByShortUrl(
  shortUrl: string,
): Promise<UrlRecord | null> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, short_url, long_url, created_at")
    .eq("short_url", shortUrl)
    .maybeSingle();
  if (error) throw error;
  return data ? toRecord(data as UrlRow) : null;
}

export async function createShortUrl(longUrl: string): Promise<UrlRecord> {
  const existing = await findByLongUrl(longUrl);
  if (existing) return existing;

  const supabase = await getSupabase();

  const { data: idData, error: idError } = await supabase.rpc("next_url_id");
  if (idError) throw idError;
  const id = Number(idData);
  const shortUrl = idToShortCode(id);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ id, short_url: shortUrl, long_url: longUrl })
    .select("id, short_url, long_url, created_at")
    .single();
  if (error) throw error;

  return toRecord(data as UrlRow);
}
