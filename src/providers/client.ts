import { Client } from "@langchain/langgraph-sdk";

export function normalizeApiUrl(apiUrl: string | undefined | null): string {
  if (!apiUrl) {
    return "";
  }

  const trimmed = apiUrl.trim();
  const absoluteUrlPattern = /^https?:\/\//i;

  if (absoluteUrlPattern.test(trimmed)) {
    return trimmed.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "");
    const relativePath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${origin}${relativePath}`.replace(/\/$/, "");
  }

  return trimmed;
}

export function createClient(apiUrl: string, apiKey: string | undefined) {
  const resolvedApiUrl = normalizeApiUrl(apiUrl);

  return new Client({
    apiKey,
    apiUrl: resolvedApiUrl,
  });
}
