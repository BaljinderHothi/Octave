"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./Profile.module.css";
import { useProfile } from "../Profile/ProfileContext";

export default function Profile() {
  const router = useRouter();
  const { bio, profilePic } = useProfile(); 

  function handleBackToHome() {
    router.push("/HomePage");
  }

  function handleGoToSettings() {
    router.push("/Settings");
  }

  return (
    <div className={styles.profileContainer}>
      <aside className={styles.sidebar}>
        <button className={styles.sidebarButton}>+</button>
        <nav className={styles.nav}>
          <button className={`${styles.navItem} ${styles.active}`}>Home</button>
          <button className={styles.navItem}>Recs</button>
          <button className={styles.navItem}>Itinerary</button>
          <button className={styles.navItem}>Profile</button>
        </nav>
      </aside>

      <div className={styles.mainContent}>
        <button onClick={handleBackToHome} className={styles.backButton}>← Home</button>

        <div className={styles.profileHeader}>
          <Image 
            src={profilePic} 
            alt="Profile" 
            className={styles.profileImage}
            width={100}
            height={100}
            priority
          />
          <div className={styles.profileInfo}>
            <h2>@jojolie</h2>
            <p className={styles.interests}>
              <i>&quot;{bio}&quot;</i>
            </p>
          </div>
        </div>

        <button onClick={handleGoToSettings} className={styles.settingsButton}>
          ⚙️ Settings
        </button>

        <div className={styles.badges}>
          <h3>Badges:</h3>
          <div className={styles.badgeList}>
            <Image src="/badges/badge1.png" alt="Badge 1" className={styles.badge} width={50} height={50} />
            <Image src="/badges/badge2.png" alt="Badge 2" className={styles.badge} width={50} height={50} />
            <Image src="/badges/badge3.png" alt="Badge 3" className={styles.badge} width={50} height={50} />
            <Image src="/badges/badge4.png" alt="Badge 4" className={styles.badge} width={50} height={50} />
          </div>
        </div>

        <div className={styles.listsSection}>
          <h3>Lists →</h3>

          <div className={styles.list}>
            <Image src="/list-icons/favorites.png" alt="Favorites" className={styles.listIcon} width={40} height={40} />
            <div>
              <h4>Favorites</h4>
              <p>Favorites list</p>
            </div>
          </div>

          <div className={styles.list}>
            <Image src="/list-icons/italian.png" alt="Italian Restaurants" className={styles.listIcon} width={40} height={40} />
            <div>
              <h4>Jolie&apos;s Top 10 Italian Restaurants 🇮🇹</h4>
              <p>Definitely will try these foods as well when I actually go to Italy :)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}