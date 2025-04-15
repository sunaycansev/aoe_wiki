import { CostType } from "../constants";

export type CostFilters = {
  [key in CostType]?: [number, number] | null;
};
