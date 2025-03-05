"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Settings.module.css";

export default function Settings() {
  const router = useRouter();
  const [bio, setBio] = useState("I love Italian and Chinese cuisine. In my free time, I enjoy rock climbing, walking trails, and going to concerts.");
  const [profilePic, setProfilePic] = useState("/profile-pic.jpg");

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
      setProfilePic(URL.createObjectURL(file)); 
    }
  }

  return (
    <div className={styles.settingsContainer}>
      <button onClick={handleBackToProfile} className={styles.backButton}>← Back to Profile</button>

      <h1 className={styles.title}>Edit Profile</h1>

      {/* Profile Picture Upload */}
      <div className={styles.profilePicContainer}>
        <img src={profilePic} alt="Profile" className={styles.profileImage} />
        <input type="file" accept="image/*" onChange={handleProfilePicChange} className={styles.fileInput} />
      </div>

      {/* Edit Bio */}
      <div className={styles.bioContainer}>
        <h2>Edit Bio</h2>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={styles.bioInput} />
      </div>

      {/* Save Changes Button */}
      <button onClick={handleSaveChanges} className={styles.saveButton}>Save Changes</button>
    </div>
  );
}
