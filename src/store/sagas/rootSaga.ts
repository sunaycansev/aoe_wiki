import { all, fork } from "redux-saga/effects";

import { watchFetchUnits } from "./unitsSaga";

export function* rootSaga() {
  yield all([fork(watchFetchUnits)]);
}
