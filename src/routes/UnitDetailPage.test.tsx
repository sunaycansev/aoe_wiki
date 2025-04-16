import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RootState } from "../store/store";
import { Unit } from "../types/units";
import UnitDetailPage from "./UnitDetailPage";

const mockUseSelector = vi.fn();
vi.mock("react-redux", () => ({
  useSelector: (selector: (state: RootState) => unknown) =>
    mockUseSelector(selector),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
  };
});

const mockUnit1: Unit = {
  id: 1,
  name: "Militia",
  description: "Basic infantry",
  expansion: "AoK",
  age: "Dark",
  cost: { Food: 60 },
  hit_points: 40,
};
const mockUnit2: Unit = {
  id: 2,
  name: "Man-at-Arms",
  description: "Upgraded infantry",
  expansion: "AoK",
  age: "Feudal",
  cost: { Food: 60, Gold: 20 },
  hit_points: 45,
};

const mockUnit3NullCost: Unit = {
  id: 3,
  name: "Missionary",
  description: "Mounted Monk",
  expansion: "AoC",
  age: "Castle",
  cost: null,
  hit_points: 45,
};
const mockUnit4MissingCost: Unit = {
  id: 4,
  name: "Trade Cog",
  description: "Transport Ship",
  expansion: "AoK",
  age: "Feudal",
  cost: { Gold: 100 },
  hit_points: 120,
};

const mockUnits = [
  mockUnit1,
  mockUnit2,
  mockUnit3NullCost,
  mockUnit4MissingCost,
];

const setupMockStore = (state: Partial<RootState["units"]>) => {
  const defaultState: RootState["units"] = {
    data: mockUnits,
    loading: "idle",
    error: null,
  };
  const mergedState = { ...defaultState, ...state };
  mockUseSelector.mockImplementation(() => mergedState);
};

const renderUnitDetailPage = (
  unitId: string | number,
  initialUnitsState: Partial<RootState["units"]> = {},
) => {
  const route = `/units/${unitId}`;
  setupMockStore({
    data: mockUnits,
    loading: "succeeded",
    ...initialUnitsState,
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/units/:id" element={<UnitDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("UnitDetailPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockStore({ loading: "succeeded", data: mockUnits });
  });

  it("should display loading message when loading", () => {
    renderUnitDetailPage(1, { loading: "pending" });
    expect(screen.getByText(/loading unit details.../i)).toBeInTheDocument();
  });

  it("should display error message when loading fails", () => {
    const errorMsg = "Failed to fetch";
    renderUnitDetailPage(1, { loading: "failed", error: errorMsg });
    expect(
      screen.getByText(`Error loading unit details: ${errorMsg}`),
    ).toBeInTheDocument();
  });

  it("should display default error message if error is null/undefined", () => {
    renderUnitDetailPage(1, { loading: "failed", error: null });
    expect(
      screen.getByText(`Error loading unit details: Unknown error`),
    ).toBeInTheDocument();
  });

  it("should display 'Unit not found' if unit ID does not exist", () => {
    renderUnitDetailPage(999);
    expect(screen.getByText(/unit not found/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to units/i }),
    ).toBeInTheDocument();
  });

  it("should display unit details correctly when unit is found", () => {
    const targetUnit = mockUnit2;
    renderUnitDetailPage(targetUnit.id);

    expect(
      screen.getByRole("heading", { name: /unit detail page/i, level: 1 }),
    ).toBeInTheDocument();

    expect(screen.getByText(/name:/i)).toBeInTheDocument();
    expect(screen.getByText(targetUnit.name)).toBeInTheDocument();

    expect(screen.getByText(/description:/i)).toBeInTheDocument();
    expect(screen.getByText(targetUnit.description)).toBeInTheDocument();

    expect(screen.getByText(/min. required age:/i)).toBeInTheDocument();
    expect(screen.getByText(targetUnit.age)).toBeInTheDocument();

    expect(screen.getByText(/food cost:/i)).toBeInTheDocument();
    expect(
      screen.getByText(targetUnit.cost!.Food!.toString()),
    ).toBeInTheDocument();

    expect(screen.getByText(/gold cost:/i)).toBeInTheDocument();
    expect(
      screen.getByText(targetUnit.cost!.Gold!.toString()),
    ).toBeInTheDocument();

    expect(screen.getByText(/hit points:/i)).toBeInTheDocument();
    expect(
      screen.getByText(targetUnit.hit_points.toString()),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /back to units/i }),
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/loading unit details.../i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/error loading unit details:/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/unit not found/i)).not.toBeInTheDocument();
  });

  it("should display 'Unknown' for costs if unit.cost is null", () => {
    const targetUnit = mockUnit3NullCost;
    renderUnitDetailPage(targetUnit.id);

    const woodLabel = screen.getByText(/wood cost:/i);
    const woodRow = woodLabel.closest("._detailRow_c542cb");
    expect(woodRow).not.toBeNull();

    expect(
      within(woodRow as HTMLElement).getByText("Unknown"),
    ).toBeInTheDocument();

    const foodLabel = screen.getByText(/food cost:/i);
    const foodRow = foodLabel.closest("._detailRow_c542cb");
    expect(foodRow).not.toBeNull();

    expect(
      within(foodRow as HTMLElement).getByText("Unknown"),
    ).toBeInTheDocument();

    const goldLabel = screen.getByText(/gold cost:/i);
    const goldRow = goldLabel.closest("._detailRow_c542cb");
    expect(goldRow).not.toBeNull();

    expect(
      within(goldRow as HTMLElement).getByText("Unknown"),
    ).toBeInTheDocument();

    const buildTimeLabel = screen.getByText(/build time:/i);
    const buildTimeRow = buildTimeLabel.closest("._detailRow_c542cb");
    expect(buildTimeRow).not.toBeNull();

    expect(
      within(buildTimeRow as HTMLElement).getByText("Unknown"),
    ).toBeInTheDocument();
  });

  it("should display 'Unknown' for specific cost if missing from cost object", () => {
    const targetUnit = mockUnit4MissingCost;
    renderUnitDetailPage(targetUnit.id);

    expect(screen.getByText(/wood cost:/i)).toBeInTheDocument();
    expect(screen.getAllByText("Unknown").length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/food cost:/i)).toBeInTheDocument();
    expect(screen.getAllByText("Unknown").length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText(/gold cost:/i)).toBeInTheDocument();
    expect(
      screen.getByText(targetUnit.cost!.Gold!.toString()),
    ).toBeInTheDocument();
  });
});
