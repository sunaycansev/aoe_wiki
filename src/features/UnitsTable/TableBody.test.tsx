import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Unit } from "../../types/units";
import { TableBody } from "./TableBody";

vi.mock("@tanstack/react-table", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@tanstack/react-table")>();
  return {
    ...original,
    flexRender: vi.fn((component) => {
      if (typeof component === "string" || typeof component === "number") {
        return component;
      }
      if (typeof component === "function") {
        return `Component(${component.name || "Anonymous"})`;
      }
      return "MockedFlexRenderContent";
    }),
  };
});

interface MockRowData {
  id: string;
  original: Partial<Unit>;
  cells: Array<{
    id: string;
    content: string | number;
  }>;
}

type MockRow = {
  id: string;
  original: Partial<Unit>;
  getVisibleCells: () => Array<{
    id: string;
    column: { columnDef: { cell: string | number } };
    getContext: () => object;
  }>;
};
const createMockRows = (rowConfigs: MockRowData[]): MockRow[] => {
  return rowConfigs.map((config) => ({
    id: config.id,
    original: config.original as Unit,
    getVisibleCells: vi.fn(() =>
      config.cells.map((cellConfig) => ({
        id: cellConfig.id,
        column: {
          columnDef: { cell: cellConfig.content },
        },
        getContext: vi.fn(() => ({})),
      })),
    ),
  }));
};

describe("TableBody Component", () => {
  const mockRowsConfig: MockRowData[] = [
    {
      id: "row1",
      original: { id: 1, name: "Archer" },
      cells: [
        { id: "cell1-1", content: 1 },
        { id: "cell1-2", content: "Archer" },
        { id: "cell1-3", content: "Feudal" },
      ],
    },
    {
      id: "row2",
      original: { id: 2, name: "Skirmisher" },
      cells: [
        { id: "cell2-1", content: 2 },
        { id: "cell2-2", content: "Skirmisher" },
        { id: "cell2-3", content: "Feudal" },
      ],
    },
  ];
  const mockRows = createMockRows(mockRowsConfig);
  const onRowClickMock = vi.fn();
  const columnsLength = mockRowsConfig[0]?.cells.length || 3;
  const noResultsMessage = "No units found";

  beforeEach(() => {
    onRowClickMock.mockClear();
  });

  it("should render table body and rows (as buttons) correctly when rows exist", () => {
    render(
      <TableBody
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows={mockRows as any}
        columnsLength={columnsLength}
        onRowClick={onRowClickMock}
        noResultsMessage={noResultsMessage}
      />,
    );

    expect(screen.getByRole("rowgroup").tagName).toBe("TBODY");

    const rows = screen.getAllByRole("button");
    expect(rows).toHaveLength(mockRowsConfig.length);

    expect(rows[0].querySelectorAll("td")).toHaveLength(columnsLength);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Archer")).toBeInTheDocument();
    expect(screen.getByText("Skirmisher")).toBeInTheDocument();
  });

  it("should call onRowClick with original row data when a row (button) is clicked", () => {
    render(
      <TableBody
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows={mockRows as any}
        columnsLength={columnsLength}
        onRowClick={onRowClickMock}
        noResultsMessage={noResultsMessage}
      />,
    );

    const rows = screen.getAllByRole("button");

    fireEvent.click(rows[0]);
    expect(onRowClickMock).toHaveBeenCalledTimes(1);
    expect(onRowClickMock).toHaveBeenCalledWith(mockRowsConfig[0].original);

    fireEvent.click(rows[1]);
    expect(onRowClickMock).toHaveBeenCalledTimes(2);
    expect(onRowClickMock).toHaveBeenCalledWith(mockRowsConfig[1].original);
  });

  it("should display 'no results' message when rows array is empty", () => {
    render(
      <TableBody
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rows={[] as any}
        columnsLength={columnsLength}
        onRowClick={onRowClickMock}
        noResultsMessage={noResultsMessage}
      />,
    );

    const noResultsRow = screen.getByRole("row");
    expect(noResultsRow).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByText(noResultsMessage)).toBeInTheDocument();
    const cell = screen.getByRole("cell");
    expect(cell).toHaveAttribute("colSpan", columnsLength.toString());
  });
});
