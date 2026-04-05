import { describe, it, expect } from "vitest";
import { EMAIL_REGEX } from "./validation";

describe("EMAIL_REGEX", () => {
  const valid = [
    "user@example.com",
    "user.name@example.com",
    "user+tag@example.com",
    "user@sub.domain.com",
    "u@e.co",
  ];

  const invalid = [
    "",
    "plaintext",
    "@missing-local.com",
    "missing-at.com",
    "user@",
    "user@ space.com",
    "user @example.com",
    "user@.com",
  ];

  it.each(valid)("accepts valid email: %s", (email) => {
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });

  it.each(invalid)("rejects invalid email: %s", (email) => {
    expect(EMAIL_REGEX.test(email)).toBe(false);
  });
});
