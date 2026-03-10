import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeUrl } from "./sanitize";

describe("sanitizeText", () => {
  it("strips HTML tags", () => {
    expect(sanitizeText("<b>bold</b>")).toBe("bold");
    expect(sanitizeText('<img src="x" onerror="alert(1)">')).toBe("");
    expect(sanitizeText("<script>alert(1)</script>")).toBe("alert(1)");
  });

  it("escapes XML entities on clean text", () => {
    expect(sanitizeText('"hello" & \'world\'')).toBe(
      "&quot;hello&quot; &amp; &#x27;world&#x27;"
    );
  });

  it("strips tags then escapes remaining chars", () => {
    // `< b & c >` is treated as a tag and stripped
    expect(sanitizeText('a < b & c > d "e"')).toBe('a  d &quot;e&quot;');
  });

  it("handles nested/malformed tags", () => {
    // <<div>inner</div>> → strips <div> and </div>, leaves "inner>"
    expect(sanitizeText("<<div>inner</div>>")).toBe("inner&gt;");
  });

  it("passes through clean text unchanged (after entity escaping)", () => {
    expect(sanitizeText("Hello World")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(sanitizeText("")).toBe("");
  });
});

describe("sanitizeUrl", () => {
  it("allows http and https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
    expect(sanitizeUrl("http://example.com/path?q=1")).toBe(
      "http://example.com/path?q=1"
    );
  });

  it("allows mailto and tel", () => {
    expect(sanitizeUrl("mailto:user@example.com")).toBe("mailto:user@example.com");
    expect(sanitizeUrl("tel:+1234567890")).toBe("tel:+1234567890");
  });

  it("allows relative paths", () => {
    expect(sanitizeUrl("/about")).toBe("/about");
    expect(sanitizeUrl("./diagram.svg")).toBe("./diagram.svg");
    expect(sanitizeUrl("images/logo.png")).toBe("images/logo.png");
  });

  it("blocks javascript: protocol", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeUrl("JAVASCRIPT:alert(1)")).toBe("");
    expect(sanitizeUrl("  javascript:alert(1)")).toBe("");
  });

  it("blocks data: protocol", () => {
    expect(sanitizeUrl("data:text/html,<h1>XSS</h1>")).toBe("");
  });

  it("blocks vbscript: protocol", () => {
    expect(sanitizeUrl("vbscript:MsgBox")).toBe("");
  });

  it("blocks unknown schemes", () => {
    expect(sanitizeUrl("custom:something")).toBe("");
    expect(sanitizeUrl("file:///etc/passwd")).toBe("");
  });

  it("returns empty for empty input", () => {
    expect(sanitizeUrl("")).toBe("");
    expect(sanitizeUrl("   ")).toBe("");
  });
});
