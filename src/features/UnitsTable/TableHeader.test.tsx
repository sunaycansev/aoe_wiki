import { HeaderGroup } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TableHeader } from "./TableHeader";

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

interface MockHeaderConfig {
  id: string;
  headerContent?: string | number;
  colSpan?: number;
  isPlaceholder?: boolean;
  canSort?: boolean;
  isSorted?: false | "asc" | "desc";
  toggleSortingHandler?: () => void;
}

const createSimpleMockData = (headerConfigs: MockHeaderConfig[][]) => {
  const mockData = headerConfigs.map((groupConfig, depth) => ({
    id: `group_${depth}`,
    headers: groupConfig.map((config) => {
      const {
        id,
        colSpan,
        isPlaceholder,
        headerContent,
        canSort,
        isSorted,
        toggleSortingHandler,
      } = config;

      return {
        id: `${id}_header`,
        colSpan: colSpan ?? 1,
        isPlaceholder: isPlaceholder ?? false,
        column: {
          id: id,
          columnDef: { header: headerContent ?? `Header ${id}` },
          getCanSort: vi.fn(() => canSort ?? false),
          getIsSorted: vi.fn(() => isSorted ?? false),
          getToggleSortingHandler: vi.fn(() => toggleSortingHandler ?? vi.fn()),
        },
        getContext: vi.fn(() => ({})),
        getSize: vi.fn(() => 150),
      };
    }),
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mockData as any as HeaderGroup<unknown>[];
};

describe("TableHeader Component", () => {
  it("should render table headers correctly based on provided data structure", () => {
    const mockHeaderConfig: MockHeaderConfig[] = [
      { id: "id", headerContent: "ID", canSort: true },
      { id: "name", headerContent: "Name", canSort: true },
      { id: "age", headerContent: "Age", canSort: false },
      { id: "cost", headerContent: "Cost", colSpan: 2, canSort: false },
    ];
    const simpleMockData = createSimpleMockData([mockHeaderConfig]);

    render(<TableHeader headerGroups={simpleMockData} />);

    expect(screen.getByRole("rowgroup").tagName).toBe("THEAD");
    expect(screen.getByRole("row")).toBeInTheDocument();

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(mockHeaderConfig.length);

    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Cost")).toBeInTheDocument();

    expect(screen.getByRole("columnheader", { name: "Cost" })).toHaveAttribute(
      "colSpan",
      "2",
    );
  });
});
