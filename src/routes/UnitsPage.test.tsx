import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as filtersActions from "@/store/slices/filtersSlice";
import { RootState } from "@/store/store";
import { Unit } from "@/types/units";

import UnitsPage from "./UnitsPage";

const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock("react-redux", () => ({
  useSelector: (selector: (state: RootState) => unknown) =>
    mockUseSelector(selector),
  useDispatch: () => mockDispatch,
}));

const mockSetSearchParams = vi.fn();
const mockSearchParams = new URLSearchParams("");

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

vi.mock("@/features/FilterSection/FilterSection", () => ({
  FilterSection: vi.fn(
    ({
      selectedAge,
      onAgeChange,
      onCostChange,
      onResetFilters,
      filteredCount,
      totalCount,
    }) => (
      <div data-testid="filter-section">
        <div data-testid="selected-age">{selectedAge}</div>
        <div data-testid="filtered-count">{filteredCount}</div>
        <div data-testid="total-count">{totalCount}</div>
        <button
          data-testid="age-change-btn"
          onClick={() => onAgeChange("Feudal")}
        >
          Change Age
        </button>
        <button
          data-testid="cost-change-btn"
          onClick={() => onCostChange("Wood", [10, 100])}
        >
          Change Cost
        </button>
        <button data-testid="reset-btn" onClick={onResetFilters}>
          Reset
        </button>
      </div>
    ),
  ),
}));

vi.mock("@/features/UnitsTable/UnitsTable", () => ({
  UnitsTable: vi.fn(
    ({
      units,
      onFilteredCountChange,
    }: {
      units: Unit[];
      onFilteredCountChange: (count: number) => void;
    }) => (
      <div data-testid="units-table">
        {units.map((unit) => (
          <div key={unit.id} data-testid="unit-item">
            {unit.name}
          </div>
        ))}
        <button
          data-testid="update-count-btn"
          onClick={() => onFilteredCountChange(units.length)}
        >
          Update Count
        </button>
      </div>
    ),
  ),
}));

vi.mock("@/components/Spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

const setupMockState = (
  unitsState: Partial<RootState["units"]> = {},
  filtersState: Partial<RootState["filters"]> = {},
) => {
  const defaultUnitsState: RootState["units"] = {
    data: [],
    loading: "idle",
    error: null,
  };

  const defaultFiltersState: RootState["filters"] = {
    selectedAge: "All",
    costFilters: {},
  };

  const mergedUnitsState = { ...defaultUnitsState, ...unitsState };
  const mergedFiltersState = { ...defaultFiltersState, ...filtersState };

  mockUseSelector.mockImplementation((selector) => {
    const fakeState = {
      units: mergedUnitsState,
      filters: mergedFiltersState,
    } as RootState;

    return selector(fakeState);
  });
};

const renderUnitsPage = (
  unitsState: Partial<RootState["units"]> = {},
  filtersState: Partial<RootState["filters"]> = {},
) => {
  setupMockState(unitsState, filtersState);

  return render(
    <BrowserRouter>
      <UnitsPage />
    </BrowserRouter>,
  );
};

describe("UnitsPage", () => {
  const sampleUnits = [
    { id: 1, name: "Archer", age: "Feudal", cost: { Wood: 25, Gold: 45 } },
    { id: 2, name: "Spearman", age: "Feudal", cost: { Wood: 25, Food: 35 } },
    { id: 3, name: "Knight", age: "Castle", cost: { Food: 60, Gold: 75 } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("age");
    mockSearchParams.delete("wood");
    mockSearchParams.delete("food");
    mockSearchParams.delete("gold");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show loading spinner when loading", () => {
    renderUnitsPage({ loading: "pending" });

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("units-table")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error-container")).not.toBeInTheDocument();
  });

  it("should show error message when loading fails", () => {
    renderUnitsPage({ loading: "failed", error: "Failed to load units" });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    expect(screen.queryByTestId("units-table")).not.toBeInTheDocument();
    expect(screen.getByText(/Failed to load units/i)).toBeInTheDocument();
  });

  it("should show units table when loading succeeds with filtered units", () => {
    renderUnitsPage({ data: sampleUnits, loading: "succeeded" });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    expect(screen.getByTestId("units-table")).toBeInTheDocument();
    expect(screen.getAllByTestId("unit-item")).toHaveLength(3);
  });

  it("should show empty state when no units match filters", () => {
    renderUnitsPage({ data: [], loading: "succeeded" });

    expect(screen.queryByTestId("units-table")).not.toBeInTheDocument();
    expect(
      screen.getByText(/No units match the current filters/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reset Filters/i)).toBeInTheDocument();
  });

  it("should change age filter when age changes", async () => {
    const user = userEvent.setup();
    const setAgeSpy = vi.spyOn(filtersActions, "setAge");

    renderUnitsPage({ data: sampleUnits, loading: "succeeded" });

    await user.click(screen.getByTestId("age-change-btn"));

    expect(setAgeSpy).toHaveBeenCalledWith("Feudal");
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should change cost filter when cost changes", async () => {
    const user = userEvent.setup();
    const setCostFilterSpy = vi.spyOn(filtersActions, "setCostFilter");

    renderUnitsPage({ data: sampleUnits, loading: "succeeded" });

    await user.click(screen.getByTestId("cost-change-btn"));

    expect(setCostFilterSpy).toHaveBeenCalledWith({
      type: "Wood",
      value: [10, 100],
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should reset filters when reset button is clicked", async () => {
    const user = userEvent.setup();
    const resetFiltersSpy = vi.spyOn(filtersActions, "resetFilters");

    mockSearchParams.set("age", "Feudal");
    mockSearchParams.set("wood", "10-100");
    mockSearchParams.set("page", "1");
    mockSearchParams.set("pageSize", "10");

    renderUnitsPage({ data: sampleUnits, loading: "succeeded" });

    await user.click(screen.getByTestId("reset-btn"));

    expect(resetFiltersSpy).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalled();

    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("should sync filters from URL parameters on initial load", async () => {
    const syncFiltersSpy = vi.spyOn(filtersActions, "syncFiltersFromUrl");

    mockSearchParams.set("age", "Feudal");
    mockSearchParams.set("wood", "10-100");
    mockSearchParams.set("food", "20-80");

    renderUnitsPage();

    await waitFor(() => {
      expect(syncFiltersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedAge: "Feudal",
          costFilters: expect.objectContaining({
            Wood: [10, 100],
            Food: [20, 80],
          }),
        }),
      );
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should update URL when filters change", async () => {
    mockSetSearchParams.mockClear();

    renderUnitsPage(
      { data: sampleUnits, loading: "succeeded" },
      {
        selectedAge: "Feudal",
        costFilters: { Wood: [10, 100] },
      },
    );

    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalled();
    });

    const mostRecentCall =
      mockSetSearchParams.mock.calls[
        mockSetSearchParams.mock.calls.length - 1
      ][0];

    const params =
      typeof mostRecentCall === "function"
        ? mostRecentCall(new URLSearchParams())
        : mostRecentCall;

    expect(params.get("age")).toBe("Feudal");
    expect(params.get("wood")).toBe("10-100");
  });

  it("should update filtered count when table changes", async () => {
    const user = userEvent.setup();

    renderUnitsPage({ data: sampleUnits, loading: "succeeded" });

    await user.click(screen.getByTestId("update-count-btn"));

    expect(screen.getByTestId("filtered-count").textContent).toBe("3");
  });
});
