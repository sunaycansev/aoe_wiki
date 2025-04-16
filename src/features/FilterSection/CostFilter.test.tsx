import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { COST_TYPES, MAX_COST, MIN_COST } from "../../constants";
import { CostFilter, type CostFilterProps } from "./CostFilter";

const mockOnCostChange = vi.fn();

const renderCostFilter = (props: Partial<CostFilterProps> = {}) => {
  const defaultProps: CostFilterProps = {
    costFilters: { Food: null, Wood: null, Gold: null },
    onCostChange: mockOnCostChange,
  };
  const combinedProps = { ...defaultProps, ...props };
  return render(<CostFilter {...combinedProps} />);
};

describe("CostFilter Component", () => {
  beforeEach(() => {
    mockOnCostChange.mockClear();
  });

  it("should render correctly with default props", () => {
    renderCostFilter();
    expect(
      screen.getByRole("heading", { name: /cost filters/i, level: 3 }),
    ).toBeInTheDocument();
    COST_TYPES.forEach((type) => {
      const row = screen.getByTestId(`cost-row-${type.toLowerCase()}`);
      expect(within(row).getByText(type)).toBeInTheDocument();
      const checkbox = within(row).getByLabelText(`Filter by ${type} cost`);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      const sliders = within(row).getAllByRole("slider");
      expect(sliders).toHaveLength(2);
      expect(sliders[0]).toHaveAttribute("data-disabled");
      expect(
        within(row).getByText(`${MIN_COST}-${MAX_COST}`),
      ).toBeInTheDocument();
    });
  });

  it("should call onCostChange, re-render with new props, and enable slider when checkbox is checked", async () => {
    const user = userEvent.setup();

    const initialProps: CostFilterProps = {
      costFilters: { Food: null, Wood: null, Gold: null },
      onCostChange: mockOnCostChange,
    };
    const { rerender } = renderCostFilter(initialProps);

    const row = screen.getByTestId("cost-row-wood");
    const woodCheckbox = within(row).getByLabelText(/filter by wood cost/i);
    const woodSliders = within(row).getAllByRole("slider");

    expect(woodCheckbox).not.toBeChecked();
    expect(woodSliders[0]).toHaveAttribute("data-disabled");

    await user.click(woodCheckbox);

    expect(mockOnCostChange).toHaveBeenCalledTimes(1);
    expect(mockOnCostChange).toHaveBeenCalledWith("Wood", [MIN_COST, MAX_COST]);

    const newProps: CostFilterProps = {
      costFilters: { Food: null, Wood: [MIN_COST, MAX_COST], Gold: null },
      onCostChange: mockOnCostChange,
    };
    rerender(<CostFilter {...newProps} />);

    await waitFor(() => {
      const updatedCheckbox =
        within(row).getByLabelText(/filter by wood cost/i);
      const updatedSliders = within(row).getAllByRole("slider");
      expect(updatedCheckbox).toBeChecked();
      expect(updatedSliders[0]).not.toHaveAttribute("data-disabled");
    });
  });

  it("should call onCostChange, re-render with new props, and disable slider when checkbox is unchecked", async () => {
    const user = userEvent.setup();

    const initialProps: CostFilterProps = {
      costFilters: { Food: null, Wood: [MIN_COST, MAX_COST], Gold: null },
      onCostChange: mockOnCostChange,
    };
    const { rerender } = renderCostFilter(initialProps);

    const row = screen.getByTestId("cost-row-wood");
    const woodCheckbox = within(row).getByLabelText(/filter by wood cost/i);

    await waitFor(() => {
      const initialCheckbox =
        within(row).getByLabelText(/filter by wood cost/i);
      const initialSliders = within(row).getAllByRole("slider");
      expect(initialCheckbox).toBeChecked();
      expect(initialSliders[0]).not.toHaveAttribute("data-disabled");
    });

    await user.click(woodCheckbox);

    expect(mockOnCostChange).toHaveBeenCalledTimes(1);
    expect(mockOnCostChange).toHaveBeenCalledWith("Wood", null);

    const newProps: CostFilterProps = {
      costFilters: { Food: null, Wood: null, Gold: null },
      onCostChange: mockOnCostChange,
    };
    rerender(<CostFilter {...newProps} />);

    await waitFor(() => {
      const updatedCheckbox =
        within(row).getByLabelText(/filter by wood cost/i);
      const updatedSliders = within(row).getAllByRole("slider");
      expect(updatedCheckbox).not.toBeChecked();
      expect(updatedSliders[0]).toHaveAttribute("data-disabled");
    });
  });
});
