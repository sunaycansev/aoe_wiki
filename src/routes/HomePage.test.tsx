import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./HomePage";

describe("HomePage Component", () => {
  it("should render the main elements correctly", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", {
      name: /welcome to the aoe codex/i,
      level: 1,
    });
    const image = screen.getByRole("img", {
      name: /age of empires ii castle siege scene/i,
    });
    const paragraph = screen.getByText(
      /explore units, stats, and details for the age of empires ii/i,
    );

    expect(heading).toBeInTheDocument();
    expect(image).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/assets/home_img_small.webp");
  });
});
