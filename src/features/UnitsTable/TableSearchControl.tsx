import React from "react";

import { MagnifyingGlassIcon } from "../../components/Icons";
import styles from "./TableSearchControl.module.scss";

interface TableSearchControlProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
}

export const TableSearchControl = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
}: TableSearchControlProps) => {
  return (
    <div className={styles.tableControls}>
      <div className={styles.searchInputContainer}>
        <MagnifyingGlassIcon className={styles.searchIcon} size={18} />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.searchInput}
          aria-label={placeholder}
        />
        {value && (
          <button
            onClick={onClear}
            className={styles.clearSearchButton}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
