import { flexRender, HeaderGroup } from "@tanstack/react-table";

import styles from "./UnitsTable.module.scss";

interface TableHeaderProps<TData> {
  headerGroups: HeaderGroup<TData>[];
}

export const TableHeader = <TData,>({
  headerGroups,
}: TableHeaderProps<TData>) => {
  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              colSpan={header.colSpan}
              onClick={
                header.column.getCanSort()
                  ? header.column.getToggleSortingHandler()
                  : undefined
              }
              className={`${styles.tableHeader} ${
                header.column.getCanSort() ? styles.sortableHeader : ""
              }`}
              style={header.column.getCanSort() ? { cursor: "pointer" } : {}}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
              <span className={styles.sortIndicator}>
                {{
                  asc: "↑",
                  desc: "↓",
                }[header.column.getIsSorted() as string] ?? null}
              </span>
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};
