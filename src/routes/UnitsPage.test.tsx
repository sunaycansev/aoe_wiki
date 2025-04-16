import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Age, CostType } from "../constants";
import { UnitsTable } from "../features/UnitsTable/UnitsTable";
import { RootState } from "../store/store";
import { Unit } from "../types/units";
import UnitsPage from "./UnitsPage";

const mockUseSelector = vi.fn();
vi.mock("react-redux", () => ({
  useSelector: () => mockUseSelector(),
}));

const mockSetSearchParams = vi.fn();
let currentSearchParams = new URLSearchParams();
const mockUseSearchParams = vi.fn(() => [
  currentSearchParams,
  mockSetSearchParams,
]);

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useSearchParams: () => mockUseSearchParams(),
  };
});

vi.mock("../features/FilterSection/FilterSection", () => ({
  FilterSection: vi.fn(({ onAgeChange, onCostChange, onResetFilters }) => (
    <div data-testid="mock-filter-section">
      <button onClick={() => onAgeChange("Feudal" as Age)}>
        Set Age Feudal
      </button>
      <button onClick={() => onAgeChange("All" as Age)}>Set Age All</button>
      <button onClick={() => onCostChange("Wood" as CostType, [50, 100])}>
        Set Wood 50-100
      </button>
      <button onClick={() => onCostChange("Wood" as CostType, null)}>
        Clear Wood Filter
      </button>
      <button onClick={() => onResetFilters()}>Reset All Filters</button>
    </div>
  )),
}));
vi.mock("../features/UnitsTable/UnitsTable", () => ({
  UnitsTable: vi.fn(({ units }) => (
    <div data-testid="mock-units-table">
      Units Table ({units?.length ?? 0} units)
    </div>
  )),
}));
vi.mock("../components/Spinner", () => ({
  Spinner: vi.fn(() => <div data-testid="mock-spinner">Loading...</div>),
}));

const setupMockStore = (state: Partial<RootState["units"]>) => {
  const defaultState: RootState["units"] = {
    data: [],
    loading: "idle",
    error: null,
  };
  const mergedState = { ...defaultState, ...state };
  mockUseSelector.mockImplementation(() => mergedState);
};

const setupMockSearchParams = (params: Record<string, string>) => {
  currentSearchParams = new URLSearchParams(params);
  mockUseSearchParams.mockReturnValue([
    currentSearchParams,
    mockSetSearchParams,
  ]);
};

const renderUnitsPage = (initialEntries = ["/units"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <UnitsPage />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  setupMockStore({ loading: "idle", data: [], error: null });
  setupMockSearchParams({});
});

const allMockUnits: Unit[] = [
  {
    id: 1,
    name: "Militia",
    description: "Basic infantry",
    expansion: "AoK",
    age: "Dark",
    cost: { Food: 60 },
    hit_points: 40,
  },
  {
    id: 2,
    name: "Man-at-Arms",
    description: "Upgraded infantry",
    expansion: "AoK",
    age: "Feudal",
    cost: { Food: 60, Gold: 20 },
    hit_points: 45,
  },
  {
    id: 3,
    name: "Spearman",
    description: "Anti-cavalry infantry",
    expansion: "AoK",
    age: "Feudal",
    cost: { Food: 35, Wood: 25 },
    hit_points: 45,
  },
  {
    id: 4,
    name: "Archer",
    description: "Basic ranged unit",
    expansion: "AoK",
    age: "Feudal",
    cost: { Wood: 25, Gold: 45 },
    hit_points: 30,
  },
  {
    id: 5,
    name: "Knight",
    description: "Heavy cavalry unit",
    expansion: "AoK",
    age: "Castle",
    cost: { Food: 60, Gold: 75 },
    hit_points: 100,
  },
  {
    id: 6,
    name: "Crossbowman",
    description: "Upgraded archer",
    expansion: "AoK",
    age: "Castle",
    cost: { Wood: 25, Gold: 45 },
    hit_points: 35,
  },
  {
    id: 7,
    name: "Pikeman",
    description: "Upgraded spearman",
    expansion: "AoK",
    age: "Castle",
    cost: { Food: 35, Wood: 25 },
    hit_points: 55,
  },
  {
    id: 8,
    name: "Champion",
    description: "Elite infantry",
    expansion: "AoK",
    age: "Imperial",
    cost: { Food: 60, Gold: 20 },
    hit_points: 70,
  },
  {
    id: 9,
    name: "Elite Skirmisher",
    description: "Anti-archer infantry",
    expansion: "AoK",
    age: "Castle",
    cost: { Food: 35, Wood: 25 },
    hit_points: 35,
  }, // Same cost as Pikeman/Spearman
  {
    id: 10,
    name: "Villager",
    description: "Worker unit",
    expansion: "AoK",
    age: "Dark",
    cost: { Food: 50 },
    hit_points: 25,
  },
  {
    id: 11,
    name: "Trade Cart",
    description: "Generates gold",
    expansion: "AoK",
    age: "Feudal",
    cost: { Wood: 100 },
    hit_points: 70,
  },
  {
    id: 12,
    name: "Scout Cavalry",
    description: "Fast scout",
    expansion: "AoK",
    age: "Dark",
    cost: { Food: 80 },
    hit_points: 45,
  },
  {
    id: 13,
    name: "Monk",
    description: "Healer/Converter",
    expansion: "AoK",
    age: "Castle",
    cost: { Gold: 100 },
    hit_points: 30,
  },
  {
    id: 14,
    name: "Missionary",
    description: "Mounted Monk (Spanish)",
    expansion: "AoC",
    age: "Castle",
    cost: null,
    hit_points: 45,
  },
];

describe("UnitsPage Component", () => {
  it("should render loading state correctly", () => {
    setupMockStore({ loading: "pending" });

    renderUnitsPage();

    expect(screen.getByTestId("mock-spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-units-table")).not.toBeInTheDocument();
    expect(screen.queryByText(/error loading units/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no units match/i)).not.toBeInTheDocument();
  });

  it("should render error state correctly", () => {
    const errorMessage = "Network Error";
    setupMockStore({ loading: "failed", error: errorMessage });

    renderUnitsPage();

    expect(
      screen.getByText(`Error loading units: ${errorMessage}`),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("mock-spinner")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-units-table")).not.toBeInTheDocument();
    expect(screen.getByTestId("mock-filter-section")).toBeInTheDocument();
    expect(screen.queryByText(/no units match/i)).not.toBeInTheDocument();
  });

  it("should render success state with data correctly", () => {
    const mockUnits: Unit[] = [
      {
        id: 1,
        name: "Archer",
        description: "Basic ranged unit",
        expansion: "AoK",
        age: "Feudal",
        cost: { Wood: 25, Gold: 45 },
        hit_points: 30,
      },
      {
        id: 2,
        name: "Knight",
        description: "Heavy cavalry unit",
        expansion: "AoK",
        age: "Castle",
        cost: { Food: 60, Gold: 75 },
        hit_points: 100,
      },
    ];
    setupMockStore({ loading: "succeeded", data: mockUnits });

    renderUnitsPage();

    expect(
      screen.getByRole("heading", { name: /units page/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-filter-section")).toBeInTheDocument();
    expect(screen.getByTestId("mock-units-table")).toBeInTheDocument();
    expect(
      screen.getByText(`Units Table (${mockUnits.length} units)`),
    ).toBeInTheDocument();

    expect(screen.queryByTestId("mock-spinner")).not.toBeInTheDocument();
    expect(screen.queryByText(/error loading units/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no units match/i)).not.toBeInTheDocument();
  });

  it("should render empty state correctly when data loads but is empty", () => {
    setupMockStore({ loading: "succeeded", data: [] });

    renderUnitsPage();

    expect(
      screen.getByRole("heading", { name: /units page/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-filter-section")).toBeInTheDocument();
    expect(
      screen.getByText(/no units match the current filters/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reset filters/i }),
    ).toBeInTheDocument();

    expect(screen.queryByTestId("mock-units-table")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-spinner")).not.toBeInTheDocument();
    expect(screen.queryByText(/error loading units/i)).not.toBeInTheDocument();
  });

  describe("Filter Interactions", () => {
    beforeEach(() => {
      setupMockStore({
        loading: "succeeded",
        data: [
          {
            id: 1,
            name: "Militia",
            description: "",
            expansion: "AoK",
            age: "Dark",
            cost: { Food: 60 },
            hit_points: 40,
          },
        ],
      });
    });

    it("should call setSearchParams with correct age when age filter changes", async () => {
      const user = userEvent.setup();
      renderUnitsPage();

      const ageButton = screen.getByRole("button", { name: /set age feudal/i });
      await user.click(ageButton);

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const expectedParams = new URLSearchParams();
      expectedParams.set("age", "Feudal");
      expect(mockSetSearchParams).toHaveBeenCalledWith(expectedParams, {
        replace: true,
      });
    });

    it("should call setSearchParams removing age when age filter is set to 'All'", async () => {
      const user = userEvent.setup();

      setupMockSearchParams({ age: "Feudal" });
      renderUnitsPage();

      const ageAllButton = screen.getByRole("button", { name: /set age all/i });
      await user.click(ageAllButton);

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const expectedParams = new URLSearchParams();
      expect(mockSetSearchParams).toHaveBeenCalledWith(expectedParams, {
        replace: true,
      });
    });

    it("should call setSearchParams with correct cost when cost filter changes", async () => {
      const user = userEvent.setup();
      renderUnitsPage();

      const woodButton = screen.getByRole("button", {
        name: /set wood 50-100/i,
      });
      await user.click(woodButton);

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const expectedParams = new URLSearchParams();
      expectedParams.set("wood", "50-100");
      expect(mockSetSearchParams).toHaveBeenCalledWith(expectedParams, {
        replace: true,
      });
    });

    it("should call setSearchParams removing cost when cost filter is cleared", async () => {
      const user = userEvent.setup();

      setupMockSearchParams({ wood: "50-100" });
      renderUnitsPage();

      const clearWoodButton = screen.getByRole("button", {
        name: /clear wood filter/i,
      });
      await user.click(clearWoodButton);

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      const expectedParams = new URLSearchParams();
      expect(mockSetSearchParams).toHaveBeenCalledWith(expectedParams, {
        replace: true,
      });
    });

    it("should not call setSearchParams if cost filter value does not change", async () => {
      const user = userEvent.setup();

      setupMockSearchParams({ wood: "50-100" });
      renderUnitsPage();

      const woodButton = screen.getByRole("button", {
        name: /set wood 50-100/i,
      });
      await user.click(woodButton);

      expect(mockSetSearchParams).not.toHaveBeenCalled();
    });

    it("should call setSearchParams removing all filters when reset button is clicked", async () => {
      const user = userEvent.setup();

      setupMockSearchParams({ age: "Castle", gold: "0-100" });
      renderUnitsPage();

      const resetButton = screen.getByRole("button", {
        name: /reset all filters/i,
      });
      await user.click(resetButton);

      expect(mockSetSearchParams).toHaveBeenCalledTimes(1);
      expect(mockSetSearchParams).toHaveBeenCalledWith({}, { replace: true });
    });
  });

  describe("URL Parameter Filtering", () => {
    const MockedUnitsTable = vi.mocked(UnitsTable);

    beforeEach(() => {
      setupMockStore({ loading: "succeeded", data: allMockUnits });
      MockedUnitsTable.mockClear();
    });

    it("should filter units correctly based on 'age' parameter", () => {
      setupMockSearchParams({ age: "Feudal" });
      renderUnitsPage();

      expect(MockedUnitsTable).toHaveBeenCalledTimes(1);
      const calls = MockedUnitsTable.mock.calls;
      const lastCallArgs = calls[calls.length - 1][0];
      const filteredUnitsProp = lastCallArgs.units;

      expect(filteredUnitsProp).toHaveLength(4);
      expect(filteredUnitsProp.map((u: Unit) => u.id)).toEqual(
        expect.arrayContaining([2, 3, 4, 11]),
      );
    });

    it("should filter units correctly based on a single 'cost' parameter (wood)", () => {
      setupMockSearchParams({ wood: "0-30" });
      renderUnitsPage();

      expect(MockedUnitsTable).toHaveBeenCalledTimes(1);
      const lastCallArgs =
        MockedUnitsTable.mock.calls[MockedUnitsTable.mock.calls.length - 1][0];
      const filteredUnitsProp = lastCallArgs.units;

      expect(filteredUnitsProp).toHaveLength(13);
      expect(filteredUnitsProp.map((u: Unit) => u.id)).toEqual(
        expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14]),
      );
    });

    it("should filter units correctly based on multiple 'cost' parameters (food & gold)", () => {
      setupMockSearchParams({ food: "50-70", gold: "10-50" });
      renderUnitsPage();

      expect(MockedUnitsTable).toHaveBeenCalledTimes(1);
      const lastCallArgs =
        MockedUnitsTable.mock.calls[MockedUnitsTable.mock.calls.length - 1][0];
      const filteredUnitsProp = lastCallArgs.units;

      expect(filteredUnitsProp).toHaveLength(2);
      expect(filteredUnitsProp.map((u: Unit) => u.id)).toEqual(
        expect.arrayContaining([2, 8]),
      );
    });

    it("should filter units correctly based on 'age' and 'cost' parameters combined", () => {
      setupMockSearchParams({ age: "Castle", gold: "40-80" });
      renderUnitsPage();

      expect(MockedUnitsTable).toHaveBeenCalledTimes(1);
      const lastCallArgs =
        MockedUnitsTable.mock.calls[MockedUnitsTable.mock.calls.length - 1][0];
      const filteredUnitsProp = lastCallArgs.units;

      expect(filteredUnitsProp).toHaveLength(2);
      expect(filteredUnitsProp.map((u: Unit) => u.id)).toEqual(
        expect.arrayContaining([5, 6]),
      );
    });

    it("should include units with null cost when cost filter range starts at 0", () => {
      setupMockSearchParams({ gold: "0-50" });
      renderUnitsPage();

      expect(MockedUnitsTable).toHaveBeenCalledTimes(1);
      const lastCallArgs =
        MockedUnitsTable.mock.calls[MockedUnitsTable.mock.calls.length - 1][0];
      const filteredUnitsProp = lastCallArgs.units;

      expect(filteredUnitsProp).toHaveLength(12);
      expect(filteredUnitsProp.map((u: Unit) => u.id)).toEqual(
        expect.arrayContaining([1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14]),
      );
    });

    it("should exclude units with null cost when cost filter range starts above 0", () => {
      setupMockSearchParams({ gold: "1-50" });
      renderUnitsPage();

      expect(MockedUnitsTable).toHaveBeenCalledTimes(1);
      const lastCallArgs =
        MockedUnitsTable.mock.calls[MockedUnitsTable.mock.calls.length - 1][0];
      const filteredUnitsProp = lastCallArgs.units;

      expect(filteredUnitsProp).toHaveLength(4);
      expect(filteredUnitsProp.map((u: Unit) => u.id)).toEqual(
        expect.arrayContaining([2, 4, 6, 8]),
      );
    });

    it("should handle case-insensitive age parameter", () => {
      setupMockSearchParams({ age: "feudal" });
      renderUnitsPage();

      expect(MockedUnitsTable).toHaveBeenCalledTimes(1);
      const calls = MockedUnitsTable.mock.calls;
      const lastCallArgs = calls[calls.length - 1][0];
      const filteredUnitsProp = lastCallArgs.units;

      expect(filteredUnitsProp).toHaveLength(4);
      expect(filteredUnitsProp.map((u: Unit) => u.id)).toEqual(
        expect.arrayContaining([2, 3, 4, 11]),
      );
    });
  });
});
