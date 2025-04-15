import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Unit } from "../../types/units";

interface UnitsState {
  data: Unit[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UnitsState = {
  data: [],
  loading: "idle",
  error: null,
};

const unitsSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    fetchUnitsStart(state) {
      state.loading = "pending";
      state.error = null;
    },
    fetchUnitsSuccess(state, action: PayloadAction<Unit[]>) {
      state.loading = "succeeded";
      state.data = action.payload;
    },
    fetchUnitsFailure(state, action: PayloadAction<string>) {
      state.loading = "failed";
      state.error = action.payload;
    },
  },
});

export const { fetchUnitsStart, fetchUnitsSuccess, fetchUnitsFailure } =
  unitsSlice.actions;

export default unitsSlice.reducer;
