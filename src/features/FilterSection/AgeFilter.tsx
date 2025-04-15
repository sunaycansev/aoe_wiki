import * as ToggleGroup from "@radix-ui/react-toggle-group";
import React from "react";

import { Age, AGES } from "../../constants";
import styles from "./AgeFilter.module.scss";

export interface AgeFilterProps {
  selectedAge: Age;
  onAgeChange: (age: Age) => void;
}

export const AgeFilter: React.FC<AgeFilterProps> = ({
  selectedAge,
  onAgeChange,
}) => {
  const currentValue = AGES.includes(selectedAge) ? selectedAge : "All";

  const handleValueChange = (value: string) => {
    if (value && AGES.includes(value as Age)) {
      onAgeChange(value as Age);
    } else {
      onAgeChange("All");
    }
  };

  return (
    <div className={styles.ageFilterContainer}>
      <label className={styles.filterLabel} htmlFor="age-filter-group">
        Ages
      </label>
      <ToggleGroup.Root
        id="age-filter-group"
        className={styles.toggleGroup}
        type="single"
        value={currentValue}
        onValueChange={handleValueChange}
        aria-label="Filter units by age"
        defaultValue="All"
      >
        {AGES.map((age) => (
          <ToggleGroup.Item
            key={age}
            value={age}
            className={styles.toggleGroupItem}
            aria-label={`Filter by ${age} age`}
            tabIndex={0}
          >
            {age}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
};
