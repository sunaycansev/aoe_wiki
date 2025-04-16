import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Age, CostType } from "@/constants";
import { CostFilters } from "@/types/filter";

export interface FiltersState {
  selectedAge: Age;
  costFilters: CostFilters;
}

const initialState: FiltersState = {
  selectedAge: "All",
  costFilters: {
    Food: null,
    Wood: null,
    Gold: null,
  },
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setAge: (state, action: PayloadAction<Age>) => {
      state.selectedAge = action.payload;
    },
    setCostFilter: (
      state,
      action: PayloadAction<{
        type: CostType;
        value: [number, number] | null;
      }>,
    ) => {
      const { type, value } = action.payload;
      state.costFilters[type] = value;
    },
    resetFilters: (state) => {
      state.selectedAge = initialState.selectedAge;
      state.costFilters = { ...initialState.costFilters };
    },
    syncFiltersFromUrl: (_state, action: PayloadAction<FiltersState>) => {
      return action.payload;
    },
  },
});

export const { setAge, setCostFilter, resetFilters, syncFiltersFromUrl } =
  filtersSlice.actions;

export default filtersSlice.reducer;
