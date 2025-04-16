import { SortingState } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Unit } from "../../types/units";
import { UnitsTable } from "./UnitsTable";

const mockNavigate = vi.fn();

const mockOnSortingChange = vi.fn();
const mockOnSearchChange = vi.fn();

vi.mock("react-router-dom", async () => {
  return {
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

describe("UnitsTable Component", () => {
  const mockUnits: Unit[] = [
    {
      id: 1,
      name: "Archer",
      description: "Quick and light ranged unit",
      expansion: "AoE2",
      age: "Feudal",
      cost: { Wood: 25, Gold: 45 },
      hit_points: 30,
    },
    {
      id: 2,
      name: "Knight",
      description: "Heavy cavalry unit",
      expansion: "AoE2",
      age: "Castle",
      cost: { Food: 60, Gold: 75 },
      hit_points: 100,
    },
    {
      id: 3,
      name: "Villager",
      description: "Gathering and construction unit",
      expansion: "AoE2",
      age: "Dark",
      cost: { Food: 50 },
      hit_points: 25,
    },
  ];

  const onFilteredCountChangeMock = vi.fn();

  const defaultProps = {
    units: mockUnits,
    onFilteredCountChange: onFilteredCountChangeMock,
    initialSort: [] as SortingState,
    initialSearch: "",
    onSortingChange: mockOnSortingChange,
    onSearchChange: mockOnSearchChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the table with units data", () => {
    render(<UnitsTable {...defaultProps} />);

    const table = screen.getByTestId("units-table");
    expect(table).toBeInTheDocument();

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(5);
    expect(headers[0]).toHaveTextContent(/id/i);
    expect(headers[1]).toHaveTextContent(/name/i);

    expect(screen.getByText("Archer")).toBeInTheDocument();
    expect(screen.getByText("Knight")).toBeInTheDocument();
    expect(screen.getByText("Villager")).toBeInTheDocument();
  });

  it("should filter units when search input changes", async () => {
    const user = userEvent.setup();
    render(<UnitsTable {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/search units by name/i);
    await user.type(searchInput, "Knight");

    expect(mockOnSearchChange).toHaveBeenCalledWith("Knight");
  });

  it("should clear search when clear button is clicked", async () => {
    const user = userEvent.setup();

    render(<UnitsTable {...defaultProps} initialSearch="Knight" />);

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    await user.click(clearButton);

    expect(mockOnSearchChange).toHaveBeenCalledWith("");
  });

  it("should navigate to unit detail page when row is clicked", async () => {
    const user = userEvent.setup();
    render(<UnitsTable {...defaultProps} />);

    const rowButtons = screen.getAllByRole("button");
    expect(rowButtons.length).toBeGreaterThan(0);

    await user.click(rowButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/units/1");
  });

  it("should handle pagination locally", async () => {
    const manyUnits = Array.from({ length: 25 }, (_, index) => ({
      id: index + 1,
      name: `Unit ${index + 1}`,
      description: `Description for unit ${index + 1}`,
      expansion: "AoE2",
      age: (index % 4 === 0
        ? "Dark"
        : index % 4 === 1
          ? "Feudal"
          : index % 4 === 2
            ? "Castle"
            : "Imperial") as "Dark" | "Feudal" | "Castle" | "Imperial",
      cost: { Food: 50 + index, Gold: 30 + index },
      hit_points: 30 + index * 2,
    }));

    const user = userEvent.setup();

    render(<UnitsTable {...defaultProps} units={manyUnits} />);

    expect(
      screen.getByText(/showing 1 to \d+ of 25 units/i),
    ).toBeInTheDocument();

    const nextPageButton = screen.getByRole("button", {
      name: /go to next page/i,
    });
    expect(nextPageButton).toBeInTheDocument();

    await user.click(nextPageButton);

    const pageInfo = screen.getByText(/page 2 of/i);
    expect(pageInfo).toBeInTheDocument();
  });

  it("should notify parent component of filtered count", () => {
    render(<UnitsTable {...defaultProps} />);

    expect(onFilteredCountChangeMock).toHaveBeenCalledWith(3);
  });
});
