import styles from "./HomePage.module.scss";

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>Welcome to the AoE Codex</h1>

      <div className={styles.imageContainer}>
        <img
          src="/assets/home_img_small.webp"
          alt="Age of Empires II Castle Siege Scene"
          className={styles.heroImage}
          fetchPriority="high"
          loading="eager"
          width={1200}
          height={675}
        />
      </div>

      <p className={styles.welcomeText}>
        Explore units, stats, and details for the Age of Empires II
      </p>
    </div>
  );
};

export default HomePage;
