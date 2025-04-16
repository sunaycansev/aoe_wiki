import { describe, expect, it } from "vitest";

import { Unit } from "@/types/units";

import unitsReducer, {
  fetchUnitsFailure,
  fetchUnitsStart,
  fetchUnitsSuccess,
} from "./unitsSlice";

interface TestUnitsState {
  data: Unit[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const mockUnit: Unit = {
  id: 1,
  name: "Archer",
  description: "Quick and light ranged unit.",
  expansion: "Age of Kings",
  age: "Feudal",
  cost: {
    Wood: 25,
    Gold: 45,
  },
  build_time: 35,
  reload_time: 2,
  attack_delay: 0.35,
  movement_rate: 0.96,
  line_of_sight: 6,
  hit_points: 30,
  range: 4,
  attack: 4,
  armor: "0/0",
  accuracy: "100%",
};

describe("unitsSlice reducer", () => {
  const initialState: TestUnitsState = {
    data: [],
    loading: "idle",
    error: null,
  };

  it("should return the initial state", () => {
    expect(unitsReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle fetchUnitsStart", () => {
    const previousState: TestUnitsState = {
      ...initialState,
      loading: "idle",
      error: "Some error",
    };
    const nextState = unitsReducer(previousState, fetchUnitsStart());
    expect(nextState.loading).toBe("pending");
    expect(nextState.error).toBeNull();
    expect(nextState.data).toEqual([]);
  });

  it("should handle fetchUnitsSuccess", () => {
    const unitsPayload = [mockUnit, { ...mockUnit, id: 2, name: "Skirmisher" }];

    const previousState: TestUnitsState = {
      ...initialState,
      loading: "pending",
    };
    const nextState = unitsReducer(
      previousState,
      fetchUnitsSuccess(unitsPayload),
    );
    expect(nextState.loading).toBe("succeeded");
    expect(nextState.error).toBeNull();
    expect(nextState.data).toEqual(unitsPayload);
  });

  it("should handle fetchUnitsFailure", () => {
    const errorPayload = "Failed to load units";

    const previousState: TestUnitsState = {
      ...initialState,
      loading: "pending",
    };
    const nextState = unitsReducer(
      previousState,
      fetchUnitsFailure(errorPayload),
    );
    expect(nextState.loading).toBe("failed");
    expect(nextState.error).toBe(errorPayload);
    expect(nextState.data).toEqual([]);
  });
});
