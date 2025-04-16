import { describe, expect, it } from "vitest";

import audioReducer from "./slices/audioSlice";
import unitsReducer from "./slices/unitsSlice";
import { store, storeConfig } from "./store";

describe("Redux Store Configuration", () => {
  it("should have the correct root reducer configuration", () => {
    expect(storeConfig.reducer).toBeDefined();

    const reducerObject = storeConfig.reducer as Record<
      string,
      (state: unknown, action: unknown) => unknown
    >;
    expect(reducerObject["units"]).toBe(unitsReducer);
    expect(reducerObject["audio"]).toBe(audioReducer);
  });

  it("should configure the middleware property as a function", () => {
    expect(storeConfig.middleware).toBeDefined();
    expect(storeConfig.middleware).toEqual(expect.any(Function));
  });

  it("should create a valid store instance", () => {
    expect(store).toBeDefined();
    expect(store.getState).toBeDefined();
    expect(store.dispatch).toBeDefined();
  });
});
