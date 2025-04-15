import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import { RootState } from "@/store/store";
import { Unit } from "@/types/units";

import styles from "./UnitDetailPage.module.scss";

const UnitDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: units,
    loading,
    error,
  } = useSelector((state: RootState) => state.units);

  const unit = units.find((unit: Unit) => unit.id === Number(id));

  if (loading === "pending") {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Loading unit details...</div>
      </div>
    );
  }

  if (loading === "failed") {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          Error loading unit details: {error || "Unknown error"}
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>Unit not found</div>
        <Link to="/units" className={styles.backLink}>
          Back to Units
        </Link>
      </div>
    );
  }

  const detailRows = [
    { label: "ID", value: unit.id },
    { label: "Name", value: unit.name },
    { label: "Description", value: unit.description },
    { label: "Min. Required Age", value: unit.age },
    { label: "Wood Cost", value: unit.cost?.Wood ?? "Unknown" },
    { label: "Food Cost", value: unit.cost?.Food ?? "Unknown" },
    { label: "Gold Cost", value: unit.cost?.Gold ?? "Unknown" },
    { label: "Build Time", value: unit.build_time ?? "Unknown" },
    { label: "Reload Time", value: unit.reload_time ?? "Unknown" },
    { label: "Hit Points", value: unit.hit_points },
    { label: "Attack", value: unit.attack ?? "Unknown" },
    { label: "Accuracy", value: unit.accuracy ?? "Unknown" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Unit Detail Page</h1>
        <Link to="/units" className={styles.backLink}>
          Back to Units
        </Link>
      </div>

      <div className={styles.detailsContainer}>
        <div className={styles.detailsTable}>
          {detailRows.map(({ label, value }) => (
            <div key={label} className={styles.detailRow}>
              <div className={styles.label}>{label}:</div>
              <div className={styles.value}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPage;
