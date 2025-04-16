import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Age, MAX_COST, MIN_COST } from "../../constants";
import { FilterSection, type FilterSectionProps } from "./FilterSection";

const mockOnAgeChange = vi.fn();
const mockOnCostChange = vi.fn();
const mockOnResetFilters = vi.fn();

const defaultProps: FilterSectionProps = {
  selectedAge: "All" as Age,
  costFilters: {
    Food: null,
    Wood: null,
    Gold: null,
  },
  onAgeChange: mockOnAgeChange,
  onCostChange: mockOnCostChange,
  onResetFilters: mockOnResetFilters,
  filteredCount: 50,
  totalCount: 100,
};

const renderFilterSection = (props: Partial<FilterSectionProps> = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(<FilterSection {...combinedProps} />);
};

describe("FilterSection Component with Real Children", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly with default props", async () => {
    renderFilterSection();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /unit filters/i, level: 2 }),
      ).toBeInTheDocument();
      expect(screen.getByText("Ages")).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /filter by feudal age/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /cost filters/i, level: 3 }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/filter by wood cost/i)).toBeInTheDocument();

      const sliders = screen.getAllByRole("slider");
      expect(sliders.length).toBeGreaterThanOrEqual(2);

      expect(sliders[0]).toHaveAttribute("data-disabled");

      expect(
        screen.getByRole("button", { name: /reset all filters/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(
        screen.getByText(defaultProps.filteredCount.toString()),
      ).toBeInTheDocument();
      expect(
        screen.getByText(defaultProps.totalCount.toString()),
      ).toBeInTheDocument();
    });
  });

  it("should call onAgeChange when an age button is clicked", async () => {
    const user = userEvent.setup();
    renderFilterSection();

    const feudalButton = await screen.findByRole("radio", {
      name: /filter by feudal age/i,
    });
    await user.click(feudalButton);

    await waitFor(() => {
      expect(mockOnAgeChange).toHaveBeenCalledTimes(1);
      expect(mockOnAgeChange).toHaveBeenCalledWith("Feudal");
    });
  });

  it("should call onCostChange with range when a cost checkbox is checked", async () => {
    const user = userEvent.setup();
    renderFilterSection();

    const woodCheckbox = await screen.findByLabelText(/filter by wood cost/i);
    await user.click(woodCheckbox);

    await waitFor(() => {
      expect(mockOnCostChange).toHaveBeenCalledTimes(1);
      expect(mockOnCostChange).toHaveBeenCalledWith("Wood", [
        MIN_COST,
        MAX_COST,
      ]);
    });
  });

  it("should call onCostChange with null when an active cost checkbox is unchecked", async () => {
    const user = userEvent.setup();
    renderFilterSection({
      costFilters: { ...defaultProps.costFilters, Wood: [0, 100] },
    });

    const woodCheckbox = await screen.findByLabelText(/filter by wood cost/i);
    await waitFor(() => {
      expect(woodCheckbox).toBeChecked();
    });
    await user.click(woodCheckbox);

    await waitFor(() => {
      expect(mockOnCostChange).toHaveBeenCalledTimes(1);
      expect(mockOnCostChange).toHaveBeenCalledWith("Wood", null);
    });
  });

  it("should call onResetFilters when reset button is clicked", async () => {
    const user = userEvent.setup();
    renderFilterSection();

    const resetButton = await screen.findByRole("button", {
      name: /reset all filters/i,
    });
    await user.click(resetButton);

    await waitFor(() => {
      expect(mockOnResetFilters).toHaveBeenCalledTimes(1);
    });
  });

  it("should display correct counts in the summary", async () => {
    const filtered = 25;
    const total = 75;
    renderFilterSection({ filteredCount: filtered, totalCount: total });

    await waitFor(() => {
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText(filtered.toString())).toBeInTheDocument();
      expect(screen.getByText(total.toString())).toBeInTheDocument();
    });
  });
});
