import React from "react";

import { CostFilters } from "@/types/filter";

import { Age } from "../../constants";
import { AgeFilter } from "./AgeFilter";
import { CostFilter } from "./CostFilter";
import styles from "./FilterSection.module.scss";

export interface FilterSectionProps {
  selectedAge: Age;
  costFilters: CostFilters;
  onAgeChange: (age: Age) => void;
  onCostChange: (
    type: keyof CostFilters,
    value: [number, number] | null,
  ) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  selectedAge,
  costFilters,
  onAgeChange,
  onCostChange,
  onResetFilters,
  filteredCount,
  totalCount,
}) => {
  return (
    <section className={styles.filterSectionContainer}>
      <div className={styles.filterHeader}>
        <div className={styles.filterHeaderLeft}>
          <h2 id="filter-heading" className={styles.filterHeading}>
            Unit Filters
          </h2>
          <button
            onClick={onResetFilters}
            className={styles.resetButton}
            aria-label="Reset all filters"
          >
            Reset Filters
          </button>
        </div>
        <div className={styles.resultsSummary} aria-live="polite">
          Showing <strong>{filteredCount}</strong> of{" "}
          <strong>{totalCount}</strong> units
        </div>
      </div>
      <div className={styles.ageFilterWrapper}>
        <AgeFilter selectedAge={selectedAge} onAgeChange={onAgeChange} />
      </div>
      <div className={styles.costFilterWrapper}>
        <CostFilter costFilters={costFilters} onCostChange={onCostChange} />
      </div>
    </section>
  );
};
