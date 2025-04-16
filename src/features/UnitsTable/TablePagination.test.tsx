import { RowSelectionState, Table, TableState } from "@tanstack/react-table"; // Import necessary types
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Unit } from "../../types/units";
import { TablePagination, TablePaginationProps } from "./TablePagination";

const createMockTableState = (paginationState: {
  pageIndex: number;
  pageSize: number;
}): Partial<TableState> => ({
  pagination: {
    pageIndex: paginationState.pageIndex,
    pageSize: paginationState.pageSize,
  },

  columnVisibility: {},
  columnOrder: [],
  columnPinning: { left: [], right: [] },
  rowPinning: { top: [], bottom: [] },
  columnFilters: [],
  globalFilter: undefined,
  sorting: [],
  grouping: [],
  expanded: {},
  rowSelection: {} as RowSelectionState,
  columnSizing: {},
  columnSizingInfo: {
    startOffset: 0,
    startSize: 0,
    deltaOffset: 0,
    deltaPercentage: 0,
    isResizingColumn: false,
    columnSizingStart: [],
  },
});

const createMockTable = (paginationState: {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
}): Partial<Table<Unit>> => {
  const { pageIndex, pageCount } = paginationState;
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return {
    getState: vi.fn(() => createMockTableState(paginationState) as TableState),
    getPageCount: vi.fn(() => pageCount),
    getCanPreviousPage: vi.fn(() => canPreviousPage),
    getCanNextPage: vi.fn(() => canNextPage),
    setPageIndex: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageSize: vi.fn(),
  };
};

const getDefaultTestProps = (
  mockTable: Partial<Table<Unit>>,
  overrides = {},
): TablePaginationProps<Unit> => {
  const pageIndex = mockTable.getState?.().pagination.pageIndex ?? 0;
  const calculatedStartItem = mockTable.getState
    ? pageIndex * (mockTable.getState().pagination.pageSize ?? 10) + 1
    : 1;
  const calculatedEndItem = mockTable.getState
    ? Math.min(
        (pageIndex + 1) * (mockTable.getState().pagination.pageSize ?? 10),
        100,
      )
    : 10;

  return {
    table: mockTable as Table<Unit>,
    totalItems: 100,
    startItem: calculatedStartItem,
    endItem: calculatedEndItem,
    ...overrides,
  };
};

describe("TablePagination Component", () => {
  let mockTable: Partial<Table<Unit>>;
  let defaultProps: TablePaginationProps<Unit>;

  it("should render pagination controls correctly", () => {
    mockTable = createMockTable({ pageIndex: 2, pageSize: 10, pageCount: 5 });
    defaultProps = getDefaultTestProps(mockTable, {
      startItem: 21,
      endItem: 30,
      totalItems: 45,
    });
    render(<TablePagination {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /go to first page/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go to previous page/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go to next page/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go to last page/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/page 3 of 5/i)).toBeInTheDocument();

    expect(
      screen.getByText(/showing 21 to 30 of 45 units/i),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/items per page/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/items per page/i)).toHaveValue("10");
  });

  it("should disable Previous/First buttons on first page", () => {
    mockTable = createMockTable({ pageIndex: 0, pageSize: 10, pageCount: 5 });
    defaultProps = getDefaultTestProps(mockTable);
    render(<TablePagination {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /go to first page/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /go to previous page/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /go to next page/i }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /go to last page/i }),
    ).toBeEnabled();
  });

  it("should disable Next/Last buttons on last page", () => {
    mockTable = createMockTable({ pageIndex: 4, pageSize: 10, pageCount: 5 });
    defaultProps = getDefaultTestProps(mockTable);
    render(<TablePagination {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /go to first page/i }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /go to previous page/i }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: /go to next page/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /go to last page/i }),
    ).toBeDisabled();
  });

  it("should call correct table methods when buttons are clicked", () => {
    mockTable = createMockTable({ pageIndex: 2, pageSize: 10, pageCount: 5 });
    defaultProps = getDefaultTestProps(mockTable);

    vi.clearAllMocks();
    render(<TablePagination {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /go to first page/i }));
    expect(mockTable.setPageIndex).toHaveBeenCalledWith(0);

    fireEvent.click(
      screen.getByRole("button", { name: /go to previous page/i }),
    );
    expect(mockTable.previousPage).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /go to next page/i }));
    expect(mockTable.nextPage).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /go to last page/i }));
    expect(mockTable.setPageIndex).toHaveBeenCalledWith(4);
  });

  it("should call setPageSize when page size select changes", async () => {
    mockTable = createMockTable({ pageIndex: 0, pageSize: 10, pageCount: 5 });
    defaultProps = getDefaultTestProps(mockTable);
    vi.clearAllMocks();
    render(<TablePagination {...defaultProps} />);
    const user = userEvent.setup();

    const select = screen.getByLabelText(/items per page/i);
    await user.selectOptions(select, "20");

    expect(mockTable.setPageSize).toHaveBeenCalledTimes(1);
    expect(mockTable.setPageSize).toHaveBeenCalledWith(20);
  });
});
