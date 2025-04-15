import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import {
  Age,
  AGES,
  COST_TYPES,
  CostType,
  MAX_COST,
  MIN_COST,
  URL_PARAMS,
} from "@/constants";

import { Spinner } from "../components/Spinner";
import { FilterSection } from "../features/FilterSection/FilterSection";
import { UnitsTable } from "../features/UnitsTable/UnitsTable";
import { RootState } from "../store/store";
import { CostFilters } from "../types/filters";
import { Unit } from "../types/units";
import styles from "./UnitsPage.module.scss";

const parseAgeParam = (param: string | null): Age => {
  if (!param) return "All";
  const lowerParam = param.toLowerCase();
  const matchedAge = AGES.find((age) => age.toLowerCase() === lowerParam);
  return matchedAge || "All"; // Return matched age (preserving original casing) or default to "All"
};

const parseCostParam = (param: string | null): [number, number] | null => {
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

// --- Component --- //

const UnitsPage = () => {
  const {
    data: allUnits,
    loading,
    error,
  } = useSelector((state: RootState) => state.units);
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Derive Filter State from URL --- //
  const selectedAge = useMemo(
    () => parseAgeParam(searchParams.get(URL_PARAMS.AGE)),
    [searchParams],
  );

  const costFilters = useMemo(() => {
    const filters: CostFilters = {};

    COST_TYPES.forEach((type) => {
      const paramKey =
        type === "Wood"
          ? URL_PARAMS.WOOD
          : type === "Food"
          ? URL_PARAMS.FOOD
          : URL_PARAMS.GOLD;
      filters[type] = parseCostParam(searchParams.get(paramKey));
    });

    return filters;
  }, [searchParams]);

  // --- Handlers to Update URL --- //
  const handleAgeChange = useCallback(
    (newAge: Age) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (newAge === "All") {
        newSearchParams.delete(URL_PARAMS.AGE);
      } else {
        newSearchParams.set(URL_PARAMS.AGE, newAge);
      }
      setSearchParams(newSearchParams, { replace: true }); // Use replace to avoid excessive history entries
    },
    [searchParams, setSearchParams],
  );

  const handleCostChange = useCallback(
    (type: CostType, value: [number, number] | null) => {
      const newSearchParams = new URLSearchParams(searchParams);
      const paramKey =
        type === "Wood"
          ? URL_PARAMS.WOOD
          : type === "Food"
          ? URL_PARAMS.FOOD
          : URL_PARAMS.GOLD;

      const currentValue = searchParams.get(paramKey);

      if (value === null) {
        // Only update URL if the parameter actually exists currently
        if (currentValue !== null) {
          newSearchParams.delete(paramKey);
          setSearchParams(newSearchParams, { replace: true });
        }
      } else {
        const newValueString = `${value[0]}-${value[1]}`;
        // Only update URL if the formatted value string is different
        if (currentValue !== newValueString) {
          newSearchParams.set(paramKey, newValueString);
          setSearchParams(newSearchParams, { replace: true });
        }
      }
      // No unconditional setSearchParams here anymore
    },
    [searchParams, setSearchParams],
  );

  // Handle Reset Filters
  const handleResetFilters = useCallback(() => {
    // Remove all filter parameters and navigate to clean URL
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // --- Filtering Logic --- //
  const filteredUnits = useMemo(() => {
    if (loading !== "succeeded") return []; // Return empty if not loaded

    return allUnits.filter((unit: Unit) => {
      // 1. Filter by Age (Case-insensitive comparison)
      if (
        selectedAge !== "All" &&
        unit.age?.toLowerCase() !== selectedAge.toLowerCase() // Use lowercase comparison
      ) {
        return false;
      }

      // 2. Filter by Costs
      for (const type of COST_TYPES) {
        const range = costFilters[type];
        if (range) {
          // Special handling for units with missing cost data (null cost)
          // This could indicate incomplete data rather than truly free units
          if (!unit.cost) {
            // If the range starts at 0, include these units with unknown cost
            // Otherwise exclude them when filtering for higher cost values
            return range[0] === 0;
          }

          const unitCost = unit.cost[type] ?? 0; // Default to 0 if cost type doesn't exist for unit
          if (unitCost < range[0] || unitCost > range[1]) {
            return false;
          }
        }
      }

      // If passed all filters
      return true;
    });
  }, [allUnits, selectedAge, costFilters, loading]);

  // Track the actual filtered count after table filtering (search)
  const [tableFilteredCount, setTableFilteredCount] = useState(
    filteredUnits.length,
  );

  // When filteredUnits changes, reset the table filtered count
  useEffect(() => {
    setTableFilteredCount(filteredUnits.length);
  }, [filteredUnits.length]);

  // Handler for when table filtered count changes
  const handleTableFilteredCountChange = useCallback((count: number) => {
    setTableFilteredCount(count);
  }, []);

  // --- Render --- //
  return (
    <div className={styles.unitsPageContainer}>
      <h1 className={styles.pageTitle}>Units Page</h1>

      <FilterSection
        selectedAge={selectedAge}
        costFilters={costFilters}
        onAgeChange={handleAgeChange}
        onCostChange={handleCostChange}
        onResetFilters={handleResetFilters}
        filteredCount={tableFilteredCount}
        totalCount={allUnits.length}
      />

      <div className={styles.contentSection}>
        {loading === "pending" && (
          <div className={styles.loadingContainer}>
            <Spinner overlay={true} />
          </div>
        )}

        {loading === "failed" && (
          <div className={styles.errorContainer}>
            <p>Error loading units: {error || "Unknown error"}</p>
          </div>
        )}

        {loading === "succeeded" && filteredUnits.length > 0 && (
          <UnitsTable
            units={filteredUnits}
            onFilteredCountChange={handleTableFilteredCountChange}
          />
        )}

        {loading === "succeeded" && filteredUnits.length === 0 && (
          <div className={styles.emptyContainer}>
            <p>No units match the current filters.</p>
            <button className={styles.resetButton} onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitsPage;
