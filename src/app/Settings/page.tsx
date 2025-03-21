
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "../Profile/ProfileContext";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const { bio, profilePic, setBio, setProfilePic } = useProfile(); 

  function handleBackToProfile() {
    router.push("/Profile");
  }

  function handleSaveChanges() {
    alert("Profile updated!");
    router.push("/Profile");
  }

  function handleProfilePicChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const newProfilePic = URL.createObjectURL(file);
      setProfilePic(newProfilePic);  
    }
  }

  return (
    <div className={styles.settingsContainer}>
      <button onClick={handleBackToProfile} className={styles.backButton}>← Back to Profile</button>

      <h1 className={styles.title}>Edit Profile</h1>


      <div className={styles.profilePicContainer}>
        <img src={profilePic} alt="Profile" className={styles.profileImage} />
        <input type="file" accept="image/*" onChange={handleProfilePicChange} className={styles.fileInput} />
      </div>


      <div className={styles.bioContainer}>
        <h2>Edit Bio</h2>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)} 
          className={styles.bioInput}
        />
      </div>

      <button onClick={handleSaveChanges} className={styles.saveButton}>Save Changes</button>
    </div>
  );
}
