import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InlineMarkdown from "./InlineMarkdown";

describe("InlineMarkdown", () => {
  it("renders bold, links, and surrounding text", () => {
    render(
      <InlineMarkdown text="Email **us** at [hi@openslop.ai](mailto:hi@openslop.ai) or read the [docs](/developers)." />,
    );

    expect(screen.getByText("us").tagName).toBe("STRONG");
    expect(
      screen.getByRole("link", { name: "hi@openslop.ai" }),
    ).toHaveAttribute("href", "mailto:hi@openslop.ai");
    expect(screen.getByRole("link", { name: "docs" })).toHaveAttribute(
      "href",
      "/developers",
    );
    expect(screen.getByText(/Email/)).toBeInTheDocument();
  });

  it("passes plain text through untouched", () => {
    render(<InlineMarkdown text="No markup here." />);
    expect(screen.getByText("No markup here.")).toBeInTheDocument();
  });
});
