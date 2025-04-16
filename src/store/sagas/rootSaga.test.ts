import { fork } from "redux-saga/effects";
import { testSaga } from "redux-saga-test-plan";

import { rootSaga } from "./rootSaga";
import { watchFetchUnits } from "./unitsSaga";

describe("rootSaga", () => {
  it("should fork all watcher sagas", () => {
    testSaga(rootSaga)
      .next()
      .all([fork(watchFetchUnits)])
      .next()
      .isDone();
  });
});
