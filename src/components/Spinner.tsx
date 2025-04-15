import styles from "./Spinner.module.scss";

interface SpinnerProps {
  overlay?: boolean;
}

export const Spinner = ({ overlay = false }: SpinnerProps) => {
  if (overlay) {
    return (
      <div className={styles.spinnerOverlay}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return <div className={styles.spinner}></div>;
};
