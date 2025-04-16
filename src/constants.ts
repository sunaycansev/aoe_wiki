export const AGES = ["All", "Dark", "Feudal", "Castle", "Imperial"] as const;
export type Age = (typeof AGES)[number];

export const COST_TYPES = ["Wood", "Food", "Gold"] as const;
export type CostType = (typeof COST_TYPES)[number];

export const MAX_COST = 200;
export const MIN_COST = 0;
export const STEP_COST = 1;

export const URL_PARAMS = {
  AGE: "age",
  WOOD: "wood",
  FOOD: "food",
  GOLD: "gold",
  PAGE: "page",
  SIZE: "size",
  SORT: "sort",
  SEARCH: "search",
} as const;
