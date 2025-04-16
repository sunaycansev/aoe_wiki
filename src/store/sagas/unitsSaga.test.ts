import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { afterEach, describe, it, vi } from "vitest";

import { Unit, UnitsData } from "../../types/units";
import {
  fetchUnitsFailure,
  fetchUnitsStart,
  fetchUnitsSuccess,
} from "../slices/unitsSlice";
import { handleFetchUnits, watchFetchUnits } from "./unitsSaga";

vi.mock("../../data/age-of-empires-units.json", () => {
  return {
    default: { units: [] as Unit[] } as UnitsData,
  };
});

const mockUnit: Unit = {
  id: 1,
  name: "Archer",
  description: "Quick and light ranged unit.",
  expansion: "Age of Kings",
  age: "Feudal",
  cost: { Wood: 25, Gold: 45 },
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

const successPayloadUnits = [mockUnit];
const successExpectedData = { units: successPayloadUnits };

describe("watchFetchUnits saga", () => {
  it("should correctly use takeLatest for fetchUnitsStart", () => {
    testSaga(watchFetchUnits)
      .next()
      .takeLatest(fetchUnitsStart.type, handleFetchUnits)
      .next()
      .isDone();
  });
});

describe("handleFetchUnits saga", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should dispatch success action after successfully importing data", async () => {
    vi.doMock("../../data/age-of-empires-units.json", () => ({
      default: successExpectedData,
    }));

    const { handleFetchUnits: handleFetchUnitsScoped } = await import(
      "./unitsSaga"
    );

    return expectSaga(handleFetchUnitsScoped)
      .put(fetchUnitsSuccess(successExpectedData.units))
      .run();
  });

  it("should dispatch failure action when the fetch call fails", () => {
    const fetchError = new Error("Failed to fetch data");

    return expectSaga(handleFetchUnits)
      .provide([[matchers.call.like({}), throwError(fetchError)]])
      .put(fetchUnitsFailure(fetchError.message))
      .run();
  });
});
