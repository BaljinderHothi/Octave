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

     
      <button onClick={handleLogout} className={styles.logoutButton}>Log Out</button>

     
      <div className={styles.recommendationBox}>
        <h2>Quick Recommendations</h2>
        <p>(This will be generated based on user preferences in the future)</p>
      </div>

     
      <div className={styles.searchContainer}>
        <input type="text" placeholder="Search for places or activities..." className={styles.searchBar} />
        <button className={styles.searchButton}>Search</button>
      </div>

     
      <button onClick={handleGenerateItinerary} className={styles.generateButton}>
        Generate Itinerary
      </button>


      <button onClick={handleGoToProfile} className={styles.profileButton}>
        Go to Profile
      </button>
    </div>
  );
}
