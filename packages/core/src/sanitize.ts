/**
 * Text and URL sanitization utilities for Siren diagrams.
 *
 * Lightweight, zero-dependency sanitizers for user-provided content.
 * Designed for plain-text labels (not HTML), so a full library like
 * DOMPurify is unnecessary.
 */

/**
 * Sanitize user-provided label text.
 *
 * 1. Strips any HTML tags (Siren labels are plain text).
 * 2. Escapes the five XML-significant characters: `< > & " '`
 *
 * @param input - Raw user string
 * @returns Sanitized string safe for embedding in SVG / HTML
 */
export function sanitizeText(input: string): string {
  // Strip HTML/XML tags
  const stripped = input.replace(/<[^>]*>/g, "");

  // Escape XML entities
  return stripped
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize a URL, blocking dangerous protocols.
 *
 * Blocks `javascript:`, `data:`, and `vbscript:` schemes.
 * Returns an empty string for any URL that fails validation.
 *
 * @param url - Raw URL string
 * @returns Sanitized URL, or empty string if invalid / dangerous
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.length === 0) return "";

  // Normalise to catch mixed-case and whitespace obfuscation tricks
  const normalized = trimmed.replace(/[\s\0]+/g, "").toLowerCase();

  const blocked = /^(javascript|data|vbscript)\s*:/i;
  if (blocked.test(normalized)) return "";

  // Must look like a real URL (absolute or protocol-relative) or a
  // same-origin relative path. Reject anything else that starts with
  // a colon-bearing scheme we didn't explicitly allow.
  try {
    // Relative paths are fine — only reject dangerous absolute schemes.
    if (/^[a-z][a-z0-9+\-.]*:/i.test(trimmed)) {
      const scheme = trimmed.slice(0, trimmed.indexOf(":")).toLowerCase();
      const allowed = new Set(["http", "https", "mailto", "tel", "ftp"]);
      if (!allowed.has(scheme)) return "";
    }
  } catch {
    return "";
  }

  return trimmed;
}
