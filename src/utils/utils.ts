import { Age, AGES, MAX_COST, MIN_COST } from "@/constants";

export const parseAgeParam = (param: string | null): Age => {
  if (!param) return "All";
  const lowerParam = param.toLowerCase();
  const matchedAge = AGES.find((age) => age.toLowerCase() === lowerParam);
  return matchedAge || "All";
};

export const parseCostParam = (
  param: string | null,
): [number, number] | null => {
  if (!param) return null;
  const parts = param.split("-");
  if (parts.length !== 2) return null;
  const min = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);
  if (
    isNaN(min) ||
    isNaN(max) ||
    min < MIN_COST ||
    max > MAX_COST ||
    min > max
  ) {
    return null;
  }
  return [min, max];
};
