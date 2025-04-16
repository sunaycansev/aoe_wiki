import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useDebounce } from "@/hooks/useDebounce";

import { COST_TYPES, CostType } from "../../constants";
import { Unit } from "../../types/units";
import { TableBody } from "./TableBody";
import { TableHeader } from "./TableHeader";
import { TablePagination } from "./TablePagination";
import { TableSearchControl } from "./TableSearchControl";
import styles from "./UnitsTable.module.scss";

interface UnitsTableProps {
  units: Unit[];
  onFilteredCountChange?: (count: number) => void;
  initialSort: SortingState;
  initialSearch: string;
  onSortingChange: (sorting: SortingState) => void;
  onSearchChange: (search: string) => void;
}

export const UnitsTable = ({
  units,
  onFilteredCountChange,
  initialSort,
  initialSearch,
  onSortingChange,
  onSearchChange,
}: UnitsTableProps) => {
  const navigate = useNavigate();

  const [sorting, setSorting] = useState<SortingState>(initialSort);

  useEffect(() => {
    setSorting(initialSort);
  }, [initialSort]);

  const [searchValue, setSearchValue] = useState(initialSearch);
  const debouncedSearchValue = useDebounce(searchValue, 300);

  const handleSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updaterOrValue) => {
      setSorting(updaterOrValue);

      if (typeof updaterOrValue === "function") {
        const newValue = updaterOrValue(sorting);
        onSortingChange(newValue);
      } else {
        onSortingChange(updaterOrValue);
      }
    },
    [sorting, onSortingChange],
  );

  useEffect(() => {
    setSearchValue(initialSearch);
  }, [initialSearch]);

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

  useEffect(() => {
    if (debouncedSearchValue !== initialSearch) {
      onSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue, initialSearch, onSearchChange]);

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
      sorting,
      globalFilter: debouncedSearchValue,
    },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _, value) => {
      const searchValue = String(value).toLowerCase();
      const unit = row.original;
      return unit.name.toLowerCase().includes(searchValue);
    },
    autoResetPageIndex: true,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 20,
      },
    },
  });

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
