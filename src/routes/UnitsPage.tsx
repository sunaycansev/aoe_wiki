import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import { Spinner } from "@/components/Spinner";
import { Age, COST_TYPES, CostType, URL_PARAMS } from "@/constants";
import { FilterSection } from "@/features/FilterSection/FilterSection";
import { UnitsTable } from "@/features/UnitsTable/UnitsTable";
import {
  selectCostFilters,
  selectSelectedAge,
} from "@/store/selectors/filterSelectors";
import {
  resetFilters,
  setAge,
  setCostFilter,
  syncFiltersFromUrl,
} from "@/store/slices/filtersSlice";
import { RootState } from "@/store/store";
import { CostFilters } from "@/types/filter";
import { Unit } from "@/types/units";
import { parseAgeParam, parseCostParam } from "@/utils/utils";

import styles from "./UnitsPage.module.scss";

const UnitsPage = () => {
  const dispatch = useDispatch();
  const {
    data: allUnits,
    loading,
    error,
  } = useSelector((state: RootState) => state.units);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedAge = useSelector(selectSelectedAge);
  const costFilters = useSelector(selectCostFilters);

  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (initialSyncDone) return;

    const ageFromUrl = parseAgeParam(searchParams.get(URL_PARAMS.AGE));
    const costFiltersFromUrl: CostFilters = {};

    COST_TYPES.forEach((type) => {
      const paramKey =
        type === "Wood"
          ? URL_PARAMS.WOOD
          : type === "Food"
            ? URL_PARAMS.FOOD
            : URL_PARAMS.GOLD;
      costFiltersFromUrl[type] = parseCostParam(searchParams.get(paramKey));
    });

    dispatch(
      syncFiltersFromUrl({
        selectedAge: ageFromUrl,
        costFilters: costFiltersFromUrl,
      }),
    );

    setInitialSyncDone(true);
  }, [dispatch, searchParams, initialSyncDone]);

  useEffect(() => {
    if (!initialSyncDone || isResetting) return;

    const newSearchParams = new URLSearchParams(searchParams);

    if (selectedAge === "All") {
      newSearchParams.delete(URL_PARAMS.AGE);
    } else {
      newSearchParams.set(URL_PARAMS.AGE, selectedAge);
    }

    COST_TYPES.forEach((type) => {
      const paramKey =
        type === "Wood"
          ? URL_PARAMS.WOOD
          : type === "Food"
            ? URL_PARAMS.FOOD
            : URL_PARAMS.GOLD;

      const range = costFilters[type];
      if (range) {
        newSearchParams.set(paramKey, `${range[0]}-${range[1]}`);
      } else {
        newSearchParams.delete(paramKey);
      }
    });

    setSearchParams(newSearchParams, { replace: true });
  }, [
    selectedAge,
    costFilters,
    initialSyncDone,
    searchParams,
    setSearchParams,
    isResetting,
  ]);

  const handleAgeChange = useCallback(
    (newAge: Age) => {
      dispatch(setAge(newAge));
    },
    [dispatch],
  );

  const handleCostChange = useCallback(
    (type: CostType, value: [number, number] | null) => {
      dispatch(setCostFilter({ type, value }));
    },
    [dispatch],
  );

  const handleResetFilters = useCallback(() => {
    setIsResetting(true);

    dispatch(resetFilters());

    const newSearchParams = new URLSearchParams();

    const page = searchParams.get("page");
    if (page) {
      newSearchParams.set("page", page);
    }

    const pageSize = searchParams.get("pageSize");
    if (pageSize) {
      newSearchParams.set("pageSize", pageSize);
    }

    setSearchParams(newSearchParams, { replace: true });

    setTimeout(() => {
      setIsResetting(false);
    }, 50);
  }, [dispatch, searchParams, setSearchParams]);

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
