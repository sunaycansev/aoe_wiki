import { flexRender, Row } from "@tanstack/react-table";

import styles from "./UnitsTable.module.scss";

interface TableBodyProps<TData> {
  rows: Row<TData>[];
  columnsLength: number;
  onRowClick: (data: TData) => void;
  noResultsMessage: string;
}

export const TableBody = <TData extends { id: number | string }>({
  rows,
  columnsLength,
  onRowClick,
  noResultsMessage,
}: TableBodyProps<TData>) => {
  return (
    <tbody>
      {rows.length > 0 ? (
        rows.map((row) => (
          <tr
            key={row.id}
            onClick={() => onRowClick(row.original)}
            className={styles.tableRow}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className={styles.tableCell}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))
      ) : (
        <tr className={styles.noResultsRow}>
          <td colSpan={columnsLength} className={styles.noResultsCell}>
            {noResultsMessage}
          </td>
        </tr>
      )}
    </tbody>
  );
};
