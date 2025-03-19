"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./RandomItinerary.module.css";

export default function RandomItineraryPage() {
  const router = useRouter();

  function handleBack() {
    router.push("/GenerateItinerary");
  }

  return (
    <div className={styles.container}>
    
      <button className={styles.backButton} onClick={handleBack}>
        ← Back
      </button>

      <h1 className={styles.title}>Generated Itinerary:</h1>

     
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Food</span>
          <button className={styles.refreshButton}>
            <span className={styles.refreshText}>Generate different suggestion</span>
            <span className={styles.refreshIcon}>🔄</span>
          </button>
        </div>
        <div className={styles.item}>
          <Image 
            src="/images/cafe-one.jpg" 
            alt="Cafe One" 
            className={styles.image} 
            width={300}
            height={200}
          />
          <div className={styles.details}>
            <h2>Cafe One</h2>
            <p><strong>Tags:</strong> Cafe, Casual</p>
            <p>Cool, casual coffee bar near City College serves breakfast &amp; light fare.</p>
            <p><strong>Address:</strong> 1619 Amsterdam Ave, New York, NY 10031</p>
            <p><strong>Hours:</strong> Open • Closes 6 PM</p>
            <p><strong>Phone:</strong> (212) 690-0060</p>
          </div>
        </div>
      </div>


      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Activity</span>
          <button className={styles.refreshButton}>
            <span className={styles.refreshText}>Generate different suggestion</span>
            <span className={styles.refreshIcon}>🔄</span>
          </button>
        </div>
        <div className={styles.item}>
          <Image 
            src="/images/billiards.jpg" 
            alt="Space Billiard Pool Hall" 
            className={styles.image} 
            width={300}
            height={200}
          />
          <div className={styles.details}>
            <h2>Space Billiard Pool Hall &amp; Sports Bar</h2>
            <p><strong>Tags:</strong> Billiards, Drinks</p>
            <p>Billiards and sports bar in Korea town. Suitable for adults.</p>
            <p><strong>Address:</strong> 34 W 32nd St Floor 12, New York, NY 10001</p>
            <p><strong>Hours:</strong> Open • Closes 3 AM</p>
            <p><strong>Phone:</strong> (212) 239-4166</p>
          </div>
        </div>
      </div>


      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Place</span>
          <button className={styles.refreshButton}>
            <span className={styles.refreshText}>Generate different suggestion</span>
            <span className={styles.refreshIcon}>🔄</span>
          </button>
        </div>
        <div className={styles.item}>
          <Image 
            src="/images/little-island.jpg" 
            alt="Little Island" 
            className={styles.image} 
            width={300}
            height={200}
          />
          <div className={styles.details}>
            <h2>Little Island</h2>
            <p><strong>Tags:</strong> Free, Park, Waterside</p>
            <p>Island park with a striking stilt design, featuring flower beds &amp; shows at a waterside.</p>
            <p><strong>Address:</strong> Pier 55 in Hudson River Park at, W 13th St, New York, NY 10014</p>
            <p><strong>Hours:</strong> 6 AM - 9 PM</p>
            <p><strong>Phone:</strong> N/A</p>
          </div>
        </div>
      </div>


      <button className={styles.fullItineraryButton}>
        REGENERATE FULL ITINERARY
      </button>
    </div>
  );
}