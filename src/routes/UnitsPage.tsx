import { SortingState } from "@tanstack/react-table";
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
  const [searchValue, setSearchValue] = useState("");

  const currentSort = useMemo(() => {
    const sortParam = searchParams.get(URL_PARAMS.SORT);
    if (sortParam) {
      try {
        return JSON.parse(sortParam);
      } catch (e) {
        console.error("Error parsing sort parameter from URL:", e);
      }
    }
    return [];
  }, [searchParams]);

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

    const search = searchParams.get(URL_PARAMS.SEARCH) || "";
    setSearchValue(search);

    setInitialSyncDone(true);
  }, [dispatch, searchParams, initialSyncDone]);

  const updateUrl = useCallback(
    (params: {
      age?: Age;
      costs?: CostFilters;
      sort?: SortingState;
      search?: string;
    }) => {
      if (!initialSyncDone) return;

      const newSearchParams = new URLSearchParams(searchParams);

      if (params.age !== undefined) {
        if (params.age === "All") {
          newSearchParams.delete(URL_PARAMS.AGE);
        } else {
          newSearchParams.set(URL_PARAMS.AGE, params.age);
        }
      }

      if (params.costs) {
        COST_TYPES.forEach((type) => {
          const paramKey =
            type === "Wood"
              ? URL_PARAMS.WOOD
              : type === "Food"
                ? URL_PARAMS.FOOD
                : URL_PARAMS.GOLD;

          const range = params.costs![type];
          if (range) {
            newSearchParams.set(paramKey, `${range[0]}-${range[1]}`);
          } else {
            newSearchParams.delete(paramKey);
          }
        });
      }

      if (params.sort !== undefined) {
        if (params.sort.length > 0) {
          newSearchParams.set(URL_PARAMS.SORT, JSON.stringify(params.sort));
        } else {
          newSearchParams.delete(URL_PARAMS.SORT);
        }
      }

      if (params.search !== undefined) {
        if (params.search) {
          newSearchParams.set(URL_PARAMS.SEARCH, params.search);
        } else {
          newSearchParams.delete(URL_PARAMS.SEARCH);
        }
      }

      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams, initialSyncDone],
  );

  useEffect(() => {
    if (!initialSyncDone || isResetting) return;

    updateUrl({
      age: selectedAge,
      costs: costFilters,
    });
  }, [selectedAge, costFilters, updateUrl, initialSyncDone, isResetting]);

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

  const handleSortingChange = useCallback(
    (sorting: SortingState) => {
      updateUrl({ sort: sorting });
    },
    [updateUrl],
  );

  const handleSearchChange = useCallback(
    (search: string) => {
      setSearchValue(search);
      updateUrl({ search });
    },
    [updateUrl],
  );

  const handleResetFilters = useCallback(() => {
    setIsResetting(true);

    dispatch(resetFilters());

    const newSearchParams = new URLSearchParams();

    const sort = searchParams.get(URL_PARAMS.SORT);
    if (sort) {
      newSearchParams.set(URL_PARAMS.SORT, sort);
    }

    const search = searchParams.get(URL_PARAMS.SEARCH);
    if (search) {
      newSearchParams.set(URL_PARAMS.SEARCH, search);
    }

    setSearchParams(newSearchParams);

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
            initialSort={currentSort}
            initialSearch={searchValue}
            onSortingChange={handleSortingChange}
            onSearchChange={handleSearchChange}
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
