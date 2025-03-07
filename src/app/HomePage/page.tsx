"use client";

import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";

export default function Dashboard() {
  const router = useRouter();

  function handleLogout() {
    router.push("/SignIn");
  }

  function handleGenerateItinerary() {
    router.push("/GenerateItinerary");
  }

  function handleGoToProfile() {
    router.push("/Profile");
  }

  return (
    <div className={styles.container}>
    
      <h1 className={styles.title}>Welcome to the Homepage!</h1>

      <div className={styles.searchContainer}>
        <input type="text" placeholder="Search Activity, food, place...etc" className={styles.searchBar} />
        <button className={styles.searchButton}>✖</button>
      </div>

      <div className={styles.recommendationBox}>
        <h2>Quick recommendations based on your preferences:</h2>
        <div className={styles.recommendationItem}>
          <div className={styles.recommendationIcon}></div>
          <span>Cafe One - 1619 Amsterdam Ave, New York, NY 10031</span>
        </div>
        <div className={styles.recommendationItem}>
          <div className={styles.recommendationIcon}></div>
          <span>Gyu-Kaku Japanese BBQ - 805 3rd Ave #2, New York, NY 10022</span>
        </div>
        <div className={styles.recommendationItem}>
          <div className={styles.recommendationIcon}></div>
          <span>Edge NYC - 30 Hudson Yards, New York, NY 10001</span>
        </div>
        <div className={styles.recommendationItem}>
          <div className={styles.recommendationIcon}></div>
          <span>Space Billiard Pool Hall & Sports Bar - 34 W 32nd St, New York, NY 10001</span>
        </div>
      </div>

      <button onClick={handleLogout} className={styles.logoutButton}>Log Out</button>

      <button onClick={handleGenerateItinerary} className={styles.generateButton}>
        Generate Itinerary
      </button>

      <button onClick={handleGoToProfile} className={styles.profileButton}>
        Go to Profile
      </button>
      
    </div>
  );
}
