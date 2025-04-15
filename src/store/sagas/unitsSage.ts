import { call, put, takeLatest } from "redux-saga/effects";

import {
  fetchUnitsFailure,
  fetchUnitsStart,
  fetchUnitsSuccess,
} from "@/store/slices/unitsSlice";
import { UnitsData } from "@/types/units";

export const fetchUnitsFromJson = async (): Promise<UnitsData> => {
  const unitsModule = await import("@/data/age-of-empires-units.json");
  return unitsModule.default as UnitsData;
};

export function* handleFetchUnits(): Generator {
  try {
    const unitsData = (yield call(fetchUnitsFromJson)) as UnitsData;
    yield put(fetchUnitsSuccess(unitsData.units));
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch units";
    yield put(fetchUnitsFailure(errorMessage));
  }
}

export function* watchFetchUnits() {
  yield takeLatest(fetchUnitsStart.type, handleFetchUnits);
}
