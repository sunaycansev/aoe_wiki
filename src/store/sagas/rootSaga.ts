import { all, fork } from "redux-saga/effects";

import { watchFetchUnits } from "./unitsSage";

export function* rootSaga() {
  yield all([fork(watchFetchUnits)]);
}
