"use client";

import { useRouter } from "next/navigation";
import styles from "./GenerateItinerary.module.css";

export default function GenerateItineraryPage() {
  const router = useRouter();

  function handleBack() {
    router.push("/HomePage");
  }

  function handleGenerateItinerary() {
    router.push("/GeneratedItinerary");
  }

  function handleGenerateRandomItinerary() {
    router.push("/RandomItinerary");
  }

  return (
    <div className={styles.container}>
      {/* Back Button */}
      <button className={styles.backButton} onClick={handleBack}>
        ← Back
      </button>

      <h1 className={styles.title}>What do you have in mind?</h1>
      <p className={styles.subtitle}>
        Check categories and let us generate an itinerary for you!
      </p>

      <div className={styles.categories}>
        {/* Food Category */}
        <div className={styles.category}>
          <label className={styles.categoryHeader}>
            <input type="checkbox" className={styles.checkbox} />
            <h2 className={styles.categoryTitle}>Food</h2>
          </label>
          <p className={styles.categoryDesc}>
            Feeling hungry? Type a cuisine or a dish, or let us select based on your preferences:
          </p>
          <input
            type="text"
            placeholder="Type a Cuisine or restaurant (Ex: Asian)"
            className={styles.inputField}
          />
        </div>

        {/* Activity Category */}
        <div className={styles.category}>
          <label className={styles.categoryHeader}>
            <input type="checkbox" className={styles.checkbox} />
            <h2 className={styles.categoryTitle}>Activity</h2>
          </label>
          <p className={styles.categoryDesc}>
            Feeling active or sporty? Type an activity, or let us select based on your preferences:
          </p>
          <input
            type="text"
            placeholder="Type an activity (Ex: billiards)"
            className={styles.inputField}
          />
        </div>

        {/* Place Category */}
        <div className={styles.category}>
          <label className={styles.categoryHeader}>
            <input type="checkbox" className={styles.checkbox} />
            <h2 className={styles.categoryTitle}>Place</h2>
          </label>
          <p className={styles.categoryDesc}>
            A Place to walk around? Type a place, or let us select based on your preferences:
          </p>
          <input
            type="text"
            placeholder="Type a place/Park (Ex: Little Islands)"
            className={styles.inputField}
          />
        </div>

        {/* Other Category */}
        <div className={styles.category}>
          <label className={styles.categoryHeader}>
            <input type="checkbox" className={styles.checkbox} />
            <h2 className={styles.categoryTitle}>Other</h2>
          </label>
          <p className={styles.categoryDesc}>
            Not finding what you are looking for? Feel free to write below and we will try to include it in your itinerary:
          </p>
          <input
            type="text"
            placeholder="Type keywords for anything"
            className={styles.inputField}
          />
        </div>
      </div>

      <button className={styles.generateButton} onClick={handleGenerateItinerary}>
        GENERATE ITINERARY!
      </button>

      <hr className={styles.divider} />

      <p className={styles.randomText}>
        Not sure what you want to do? Click <strong>"Generate Random Itinerary"</strong> and let us generate a fun day for you!
      </p>

      <button className={styles.randomButton} onClick={handleGenerateRandomItinerary}>
        GENERATE RANDOM ITINERARY!
      </button>
    </div>
  );
}
