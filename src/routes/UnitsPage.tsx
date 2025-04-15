import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { Spinner } from "@/components/Spinner";
import {
  Age,
  AGES,
  COST_TYPES,
  CostType,
  MAX_COST,
  MIN_COST,
  URL_PARAMS,
} from "@/constants";
import { FilterSection } from "@/features/FilterSection/FilterSection";
import { UnitsTable } from "@/features/UnitsTable/UnitsTable";
import { RootState } from "@/store/store";
import { CostFilters } from "@/types/filter";
import { Unit } from "@/types/units";

import styles from "./UnitsPage.module.scss";

const parseAgeParam = (param: string | null): Age => {
  if (!param) return "All";
  const lowerParam = param.toLowerCase();
  const matchedAge = AGES.find((age) => age.toLowerCase() === lowerParam);
  return matchedAge || "All";
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

const UnitsPage = () => {
  const {
    data: allUnits,
    loading,
    error,
  } = useSelector((state: RootState) => state.units);
  const [searchParams, setSearchParams] = useSearchParams();

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

  const handleAgeChange = useCallback(
    (newAge: Age) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (newAge === "All") {
        newSearchParams.delete(URL_PARAMS.AGE);
      } else {
        newSearchParams.set(URL_PARAMS.AGE, newAge);
      }
      setSearchParams(newSearchParams, { replace: true });
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
        if (currentValue !== null) {
          newSearchParams.delete(paramKey);
          setSearchParams(newSearchParams, { replace: true });
        }
      } else {
        const newValueString = `${value[0]}-${value[1]}`;
        if (currentValue !== newValueString) {
          newSearchParams.set(paramKey, newValueString);
          setSearchParams(newSearchParams, { replace: true });
        }
      }
    },
    [searchParams, setSearchParams],
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const filteredUnits = useMemo(() => {
    if (loading !== "succeeded") return [];

    return allUnits.filter((unit: Unit) => {
      if (
        selectedAge !== "All" &&
        unit.age?.toLowerCase() !== selectedAge.toLowerCase()
      ) {
        return false;
      }

      for (const type of COST_TYPES) {
        const range = costFilters[type];
        if (range) {
          if (!unit.cost) {
            return range[0] === 0;
          }

          const unitCost = unit.cost[type] ?? 0;
          if (unitCost < range[0] || unitCost > range[1]) {
            return false;
          }
        }
      }

      return true;
    });
  }, [allUnits, selectedAge, costFilters, loading]);

  const [tableFilteredCount, setTableFilteredCount] = useState(
    filteredUnits.length,
  );

  useEffect(() => {
    setTableFilteredCount(filteredUnits.length);
  }, [filteredUnits.length]);

  const handleTableFilteredCountChange = useCallback((count: number) => {
    setTableFilteredCount(count);
  }, []);

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
