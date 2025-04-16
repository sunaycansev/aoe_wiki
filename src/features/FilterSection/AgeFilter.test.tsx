import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Age, AGES } from "../../constants";
import { AgeFilter, type AgeFilterProps } from "./AgeFilter";

const mockOnAgeChange = vi.fn();

const renderAgeFilter = (props: Partial<AgeFilterProps> = {}) => {
  const defaultProps: AgeFilterProps = {
    selectedAge: "All",
    onAgeChange: mockOnAgeChange,
  };
  const combinedProps = { ...defaultProps, ...props };
  render(<AgeFilter {...combinedProps} />);
};

describe("AgeFilter Component", () => {
  beforeEach(() => {
    mockOnAgeChange.mockClear();
  });

  it("should render all age buttons correctly", () => {
    renderAgeFilter();

    expect(screen.getByText("Ages")).toBeInTheDocument();

    AGES.forEach((age) => {
      expect(
        screen.getByRole("radio", { name: `Filter by ${age} age` }),
      ).toBeInTheDocument();
    });
  });

  it("should have 'All' selected by default", () => {
    renderAgeFilter();
    const allButton = screen.getByRole("radio", { name: /filter by all age/i });
    expect(allButton).toBeChecked();
    expect(allButton).toHaveAttribute("data-state", "on");
  });

  it("should have the correct age selected based on props", () => {
    const selected: Age = "Castle";
    renderAgeFilter({ selectedAge: selected });
    const castleButton = screen.getByRole("radio", {
      name: /filter by castle age/i,
    });
    expect(castleButton).toBeChecked();
    expect(castleButton).toHaveAttribute("data-state", "on");

    const allButton = screen.getByRole("radio", { name: /filter by all age/i });
    expect(allButton).not.toBeChecked();
    expect(allButton).toHaveAttribute("data-state", "off");
  });

  it("should call onAgeChange with the correct age when a button is clicked", async () => {
    const user = userEvent.setup();
    renderAgeFilter();

    const darkButton = screen.getByRole("radio", {
      name: /filter by dark age/i,
    });
    const feudalButton = screen.getByRole("radio", {
      name: /filter by feudal age/i,
    });

    await user.click(darkButton);
    expect(mockOnAgeChange).toHaveBeenCalledTimes(1);
    expect(mockOnAgeChange).toHaveBeenCalledWith("Dark");

    await user.click(feudalButton);
    expect(mockOnAgeChange).toHaveBeenCalledTimes(2);
    expect(mockOnAgeChange).toHaveBeenLastCalledWith("Feudal");
  });

  it("should select 'All' and not call onAgeChange if invalid selectedAge prop is passed", () => {
    // @ts-expect-error Testing invalid prop value handling
    renderAgeFilter({ selectedAge: "invalid-age" });

    const allButton = screen.getByRole("radio", { name: /filter by all age/i });
    expect(allButton).toBeChecked();
    expect(allButton).toHaveAttribute("data-state", "on");

    expect(mockOnAgeChange).not.toHaveBeenCalled();
  });
});
