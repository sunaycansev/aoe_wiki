import * as Checkbox from "@radix-ui/react-checkbox";
import * as Label from "@radix-ui/react-label";
import * as Slider from "@radix-ui/react-slider";
import React, { useEffect, useState } from "react";

import { CheckIcon } from "../../components/Icons";
import {
  COST_TYPES,
  CostType,
  MAX_COST,
  MIN_COST,
  STEP_COST,
} from "../../constants";
import { CostFilters } from "../../types/filter";
import styles from "./CostFilter.module.scss";

export interface CostFilterProps {
  costFilters: CostFilters;
  onCostChange: (
    type: keyof CostFilters,
    value: [number, number] | null,
  ) => void;
}

export const CostFilter: React.FC<CostFilterProps> = ({
  costFilters,
  onCostChange,
}) => {
  const [liveSliderValues, setLiveSliderValues] = useState<CostFilters>({});

  useEffect(() => {
    setLiveSliderValues(costFilters);
  }, [costFilters]);

  const handleCheckedChange = (
    checked: boolean | "indeterminate",
    type: CostType,
  ) => {
    if (checked === true) {
      const initialRange: [number, number] = [MIN_COST, MAX_COST];
      onCostChange(type, initialRange);
      setLiveSliderValues((prev) => ({ ...prev, [type]: initialRange }));
    } else {
      onCostChange(type, null);
      setLiveSliderValues((prev) => ({ ...prev, [type]: null }));
    }
  };

  const handleSliderValueChange = (value: number[], type: CostType) => {
    if (value.length === 2) {
      setLiveSliderValues((prev) => ({
        ...prev,
        [type]: [value[0], value[1]],
      }));
    }
  };

  const handleSliderCommit = (value: number[], type: CostType) => {
    if (value.length === 2) {
      onCostChange(type, [value[0], value[1]]);
    }
  };

  return (
    <div className={styles.costFilterContainer}>
      <div className={styles.filterHeader}>
        <h3 className={styles.filterLabel}>Cost Filters</h3>
      </div>
      <div className={styles.costItemsWrapper}>
        {COST_TYPES.map((type) => {
          const isActive = costFilters[type] != null;
          const displayRange = liveSliderValues[type] ?? [MIN_COST, MAX_COST];
          const sliderId = `slider-${type.toLowerCase()}`;
          const checkboxId = `checkbox-${type.toLowerCase()}`;

          return (
            <div
              key={type}
              className={styles.costItemRow}
              data-testid={`cost-row-${type.toLowerCase()}`}
            >
              <div className={styles.checkboxContainer}>
                <Checkbox.Root
                  className={styles.checkboxRoot}
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(checked, type)
                  }
                  id={checkboxId}
                  aria-label={`Filter by ${type} cost`}
                >
                  <Checkbox.Indicator className={styles.checkboxIndicator}>
                    <CheckIcon />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <Label.Root
                  className={styles.checkboxLabel}
                  htmlFor={checkboxId}
                >
                  {type}
                </Label.Root>
              </div>

              <div className={styles.sliderAndRangeContainer}>
                <div className={styles.sliderContainer}>
                  <Slider.Root
                    className={styles.sliderRoot}
                    value={liveSliderValues[type] ?? [MIN_COST, MAX_COST]}
                    onValueChange={(value) =>
                      handleSliderValueChange(value, type)
                    }
                    onValueCommit={(value) => handleSliderCommit(value, type)}
                    min={MIN_COST}
                    max={MAX_COST}
                    step={STEP_COST}
                    minStepsBetweenThumbs={1}
                    aria-label={`${type} cost range selector`}
                    id={sliderId}
                    disabled={!isActive}
                  >
                    <Slider.Track className={styles.sliderTrack}>
                      <div className={styles.sliderTickMarks}>
                        {[0, 25, 50, 75, 100, 125, 150, 175, 200].map(
                          (tick) => (
                            <div
                              key={tick}
                              className={styles.sliderTickMark}
                              style={{ left: `${(tick / MAX_COST) * 100}%` }}
                              aria-hidden="true"
                            />
                          ),
                        )}
                      </div>
                      <Slider.Range className={styles.sliderRange} />
                    </Slider.Track>
                    <Slider.Thumb
                      className={styles.sliderThumb}
                      aria-label="Minimum cost"
                    />
                    <Slider.Thumb
                      className={styles.sliderThumb}
                      aria-label="Maximum cost"
                    />
                  </Slider.Root>
                </div>

                <div className={styles.rangeDisplay} aria-live="polite">
                  {`${displayRange[0]}-${displayRange[1]}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
