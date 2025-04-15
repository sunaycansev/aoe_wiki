import { Table } from "@tanstack/react-table";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

import styles from "./TablePagination.module.scss";

export interface TablePaginationProps<TData> {
  table: Table<TData>;
  totalItems: number;
  startItem: number;
  endItem: number;
}

export const TablePagination = <TData,>({
  table,
  totalItems,
  startItem,
  endItem,
}: TablePaginationProps<TData>) => {
  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();

  if (totalItems === 0) {
    return null;
  }

  if (totalPages <= 1) {
    return (
      <div className={styles.paginationContainerMinimal}>
        <div className={styles.paginationInfo}>
          {`Showing ${startItem} to ${endItem} of ${totalItems} units`}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.paginationInfo}>
        {`Showing ${startItem} to ${endItem} of ${totalItems} units`}
      </div>

      <div className={styles.paginationControls}>
        <div className={styles.pageSizeSelector}>
          <label htmlFor="page-size">Items per page:</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className={styles.pageSizeSelect}
          >
            {PAGE_SIZE_OPTIONS.map((pageSizeOption: number) => (
              <option key={pageSizeOption} value={pageSizeOption}>
                {pageSizeOption}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.pageControls}>
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className={styles.pageButton}
            aria-label="Go to first page"
          >
            «
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={styles.pageButton}
            aria-label="Go to previous page"
          >
            ‹
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={styles.pageButton}
            aria-label="Go to next page"
          >
            ›
          </button>
          <button
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
            className={styles.pageButton}
            aria-label="Go to last page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};
