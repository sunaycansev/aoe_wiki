import { configureStore, ConfigureStoreOptions } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import { rootSaga } from "@/store/sagas/rootSaga";
import audioReducer from "@/store/slices/audioSlice";

const sagaMiddleware = createSagaMiddleware();

const rootReducer = {
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
