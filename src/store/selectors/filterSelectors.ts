import { Age } from "@/constants";
import { CostFilters } from "@/types/filter";

import { FiltersState } from "../slices/filtersSlice";
import { RootState } from "../store";

export const selectFiltersState = (state: RootState): FiltersState =>
  state.filters;

export const selectSelectedAge = (state: RootState): Age =>
  selectFiltersState(state).selectedAge;

export const selectCostFilters = (state: RootState): CostFilters =>
  selectFiltersState(state).costFilters;
