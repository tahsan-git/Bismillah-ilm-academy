import type { Locale } from "@/lib/types";
import bn from "@/messages/bn.json";
import en from "@/messages/en.json";

const dict = { bn, en } as const;

type DeepRecord = { [k: string]: string | DeepRecord };

function getNested(obj: DeepRecord, path: string): string {
  const parts = path.split(".");
  let cur: string | DeepRecord = obj;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null) return path;
    cur = cur[p];
    if (cur === undefined) return path;
  }
  return typeof cur === "string" ? cur : path;
}

export function tr(locale: Locale, path: string): string {
  return getNested(dict[locale] as unknown as DeepRecord, path);
}