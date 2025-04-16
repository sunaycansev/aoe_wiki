import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Unit } from "../../types/units";
import { UnitsTable } from "./UnitsTable";

const mockNavigate = vi.fn();
const mockSetSearchParams = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("react-router-dom", async () => {
  return {
    useNavigate: () => mockNavigate,
    useSearchParams: () => [currentSearchParams, mockSetSearchParams],
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

  beforeEach(() => {
    vi.clearAllMocks();
    currentSearchParams = new URLSearchParams();
  });

  it("should render the table with units data", () => {
    render(
      <UnitsTable
        units={mockUnits}
        onFilteredCountChange={onFilteredCountChangeMock}
      />,
    );

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
    render(
      <UnitsTable
        units={mockUnits}
        onFilteredCountChange={onFilteredCountChangeMock}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/search units by name/i);
    await user.type(searchInput, "Knight");

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining(new URLSearchParams({ search: "Knight" })),
      expect.anything(),
    );
  });

  it("should clear search when clear button is clicked", async () => {
    const user = userEvent.setup();

    currentSearchParams.set("search", "Knight");

    render(
      <UnitsTable
        units={mockUnits}
        onFilteredCountChange={onFilteredCountChangeMock}
      />,
    );

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    await user.click(clearButton);

    expect(mockSetSearchParams).toHaveBeenCalledWith(
      expect.objectContaining(new URLSearchParams()),
      expect.anything(),
    );
  });

  it("should navigate to unit detail page when row is clicked", async () => {
    const user = userEvent.setup();
    render(
      <UnitsTable
        units={mockUnits}
        onFilteredCountChange={onFilteredCountChangeMock}
      />,
    );

    const rowButtons = screen.getAllByRole("button");
    expect(rowButtons.length).toBeGreaterThan(0);

    await user.click(rowButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/units/1");
  });

  it("should update URL when pagination controls are used", async () => {
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

    mockSetSearchParams.mockClear();

    render(
      <UnitsTable
        units={manyUnits}
        onFilteredCountChange={onFilteredCountChangeMock}
      />,
    );

    expect(
      screen.getByText(/showing 1 to \d+ of 25 units/i),
    ).toBeInTheDocument();

    const nextPageButton = screen.getByRole("button", {
      name: /go to next page/i,
    });
    expect(nextPageButton).toBeInTheDocument();

    await user.click(nextPageButton);

    expect(mockSetSearchParams).toHaveBeenCalled();

    const lastCallArgs =
      mockSetSearchParams.mock.calls[mockSetSearchParams.mock.calls.length - 1];
    const updatedParams = lastCallArgs[0];

    expect(updatedParams.get("page")).toBe("1");
  });

  it("should notify parent component of filtered count", () => {
    render(
      <UnitsTable
        units={mockUnits}
        onFilteredCountChange={onFilteredCountChangeMock}
      />,
    );

    expect(onFilteredCountChangeMock).toHaveBeenCalledWith(3);
  });
});
