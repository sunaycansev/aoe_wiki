import { configureStore, ConfigureStoreOptions } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { rootSaga } from "./sagas/rootSaga";
import audioReducer from "./slices/audioSlice";
import unitsReducer from "./slices/unitsSlice";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = {
  units: unitsReducer,
  audio: audioReducer,
};

export const storeConfig: ConfigureStoreOptions = {
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
};

export const store = configureStore(storeConfig);

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
