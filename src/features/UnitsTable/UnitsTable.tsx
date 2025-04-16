import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useDebounce } from "@/hooks/useDebounce";

import { COST_TYPES, CostType, URL_PARAMS } from "../../constants";
import { Unit } from "../../types/units";
import { TableBody } from "./TableBody";
import { TableHeader } from "./TableHeader";
import { TablePagination } from "./TablePagination";
import { TableSearchControl } from "./TableSearchControl";
import styles from "./UnitsTable.module.scss";

interface UnitsTableProps {
  units: Unit[];
  onFilteredCountChange?: (count: number) => void;
}

export const UnitsTable = ({
  units,
  onFilteredCountChange,
}: UnitsTableProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const derivedSorting = useMemo((): SortingState => {
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

  const derivedPagination = useMemo((): PaginationState => {
    const pageIndex = parseInt(searchParams.get(URL_PARAMS.PAGE) || "0", 10);
    const pageSizeParam = parseInt(
      searchParams.get(URL_PARAMS.SIZE) || "20",
      10,
    );
    const pageSize = pageSizeParam;
    return { pageIndex: Math.max(0, pageIndex), pageSize };
  }, [searchParams]);

  const initialGlobalFilter = useMemo(() => {
    return searchParams.get(URL_PARAMS.SEARCH) || "";
  }, [searchParams]);

  const [searchValue, setSearchValue] = useState(initialGlobalFilter);
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const handlePaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const currentPagination = derivedPagination;
      const newPagination =
        typeof updater === "function" ? updater(currentPagination) : updater;

      if (
        newPagination.pageIndex !== currentPagination.pageIndex ||
        newPagination.pageSize !== currentPagination.pageSize
      ) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set(
          URL_PARAMS.PAGE,
          newPagination.pageIndex.toString(),
        );
        newSearchParams.set(URL_PARAMS.SIZE, newPagination.pageSize.toString());
        setSearchParams(newSearchParams, { replace: true });
      }
    },
    [searchParams, setSearchParams, derivedPagination],
  );

  const handleSortingChange = useCallback(
    (updater: Updater<SortingState>) => {
      const currentSorting = derivedSorting;
      const newSorting =
        typeof updater === "function" ? updater(currentSorting) : updater;

      if (JSON.stringify(newSorting) !== JSON.stringify(currentSorting)) {
        const newSearchParams = new URLSearchParams(searchParams);
        if (newSorting.length > 0) {
          newSearchParams.set(URL_PARAMS.SORT, JSON.stringify(newSorting));
        } else {
          newSearchParams.delete(URL_PARAMS.SORT);
        }
        setSearchParams(newSearchParams, { replace: true });
      }
    },
    [searchParams, setSearchParams, derivedSorting],
  );

  useEffect(() => {
    setSearchValue(initialGlobalFilter);
  }, [initialGlobalFilter]);

  const handleRowClick = useCallback(
    (unit: Unit) => {
      navigate(`/units/${unit.id}`);
    },
    [navigate],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
  };

  const renderDetailedCosts = (cost: Unit["cost"]) => {
    if (!cost) {
      return (
        <div className={styles.costDetailsContainer}>
          <span className={styles.unknownCost}>Unknown Cost</span>
        </div>
      );
    }

    return (
      <div className={styles.costDetailsContainer}>
        {COST_TYPES.map((type) => {
          const value = cost[type as CostType];
          if (value === undefined) return null;
          return (
            <span key={type} className={styles.costDetail}>
              {type}: {value}
            </span>
          );
        })}
      </div>
    );
  };

  const columnHelper = createColumnHelper<Unit>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <div className={styles.descriptionCell}>{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("age", {
        header: "Age",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("cost", {
        header: "Costs",
        cell: (info) => renderDetailedCosts(info.getValue()),
        sortingFn: (rowA, rowB) => {
          const costA = rowA.original.cost;
          const costB = rowB.original.cost;
          if (!costA && !costB) return 0;
          if (!costA) return -1;
          if (!costB) return 1;

          const totalCostA = Object.values(costA).reduce(
            (sum, val) => sum + (val || 0),
            0,
          );
          const totalCostB = Object.values(costB).reduce(
            (sum, val) => sum + (val || 0),
            0,
          );

          return totalCostA - totalCostB;
        },
      }),
    ],
    [columnHelper],
  );

  const table = useReactTable({
    data: units,
    columns,
    state: {
      sorting: derivedSorting,
      pagination: derivedPagination,
      globalFilter: debouncedSearchValue,
    },
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    manualPagination: false,
    manualSorting: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _, value) => {
      const searchValue = String(value).toLowerCase();
      const unit = row.original;
      return unit.name.toLowerCase().includes(searchValue);
    },
  });

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (debouncedSearchValue) {
      newSearchParams.set(URL_PARAMS.SEARCH, debouncedSearchValue);
    } else {
      newSearchParams.delete(URL_PARAMS.SEARCH);
    }
    if (searchParams.get(URL_PARAMS.SEARCH) !== debouncedSearchValue) {
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [debouncedSearchValue, searchParams, setSearchParams]);

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalItems = table.getFilteredRowModel().rows.length;

  const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(totalItems);
    }
  }, [totalItems, onFilteredCountChange]);

  const noResultsMessage =
    units.length > 0 && totalItems === 0
      ? "No units match your filters or search"
      : "No units available";

  return (
    <div className={styles.tableWrapper} data-testid="units-table">
      <TableSearchControl
        value={searchValue}
        onChange={handleSearchChange}
        onClear={handleClearSearch}
        placeholder="Search units by name..."
      />

      <div className={styles.tableContainer}>
        <table className={styles.unitsTable}>
          <TableHeader headerGroups={table.getHeaderGroups()} />
          <TableBody
            rows={table.getRowModel().rows}
            columnsLength={columns.length}
            onRowClick={handleRowClick}
            noResultsMessage={noResultsMessage}
          />
        </table>
      </div>

      <TablePagination
        table={table}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
      />
    </div>
  );
};
