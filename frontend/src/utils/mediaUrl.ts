export function toMediaUrl(url?: string | null): string | null {
  if (!url) return null;

  if (/^https?:\/\//i.test(url) || url.startsWith("blob:")) {
    return url;
  }

  if (!url.startsWith("/")) {
    return url;
  }

  if (typeof window === "undefined") {
    return url;
  }

  const apiOrigin = window.location.origin;
  return new URL(url, apiOrigin).toString();
}
