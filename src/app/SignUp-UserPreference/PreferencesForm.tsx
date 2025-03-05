"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";

type PreferencesState = {
  food: string[];
  activities: string[];
  places: string[];
  custom: string[];
};

export function PreferencesForm() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<PreferencesState>({
    food: [],
    activities: [],
    places: [],
    custom: [],
  });

  function handleCheckboxChange(category: keyof PreferencesState, option: string) {
    setPreferences((prev) => {
      const updatedCategory = prev[category].includes(option)
        ? prev[category].filter((item) => item !== option)
        : [...prev[category], option];

      return { ...prev, [category]: updatedCategory };
    });
  }

  function handleCustomInput(category: keyof PreferencesState, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const inputElement = event.target as HTMLInputElement;
      if (inputElement.value.trim() !== "") {
        setPreferences((prev) => ({
          ...prev,
          [category]: [...prev[category], inputElement.value.trim()],
        }));
        inputElement.value = "";
      }
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    console.log("User Preferences:", preferences);

    router.push("/HomePage");
  }

  function handleBack() {
    router.push("/SignUp-UserInfo");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <fieldset className={styles.category}>
        <legend>Food Preferences:</legend>
        <p>Favorite cuisines and dishes? You can add more in "Other"!</p>
        {["Italian", "Mexican", "Sushi", "BBQ", "Vegan", "Fast Food", "Pizza", "Indian", "Latin Fusion"].map((food) => (
          <label key={food}>
            <input type="checkbox" onChange={() => handleCheckboxChange("food", food)} />
            {food}
          </label>
        ))}
        <input type="text" placeholder="Other (Type and press Enter)" onKeyDown={(e) => handleCustomInput("food", e)} className={styles.input} />
      </fieldset>

      <fieldset className={styles.category}>
        <legend>Activities:</legend>
        <p>What activities do you enjoy? You can add more in "Other"!</p>
        {["Bowling", "Billiards", "Rock Climbing", "Night Life", "Movies", "Running", "Swimming", "Yoga", "Dancing"].map((activity) => (
          <label key={activity}>
            <input type="checkbox" onChange={() => handleCheckboxChange("activities", activity)} />
            {activity}
          </label>
        ))}
        <input type="text" placeholder="Other (Type and press Enter)" onKeyDown={(e) => handleCustomInput("activities", e)} className={styles.input} />
      </fieldset>

      <fieldset className={styles.category}>
        <legend>Places to Visit:</legend>
        <p>Favorite places to visit? You can add more in "Other"!</p>
        {["Museums", "Parks", "Zoos", "Landmarks", "Tourist Attractions", "Beaches", "Theaters", "Malls", "Libraries"].map((place) => (
          <label key={place}>
            <input type="checkbox" onChange={() => handleCheckboxChange("places", place)} />
            {place}
          </label>
        ))}
        <input type="text" placeholder="Other (Type and press Enter)" onKeyDown={(e) => handleCustomInput("places", e)} className={styles.input} />
      </fieldset>


      <fieldset className={styles.category}>
        <legend>Tell Us More!:</legend>
        <p>Did we miss anything? Feel free to Write anything you'd like us to know about you. This will train our model to give you better recommendations :)</p>
        <textarea className={styles.textarea} placeholder="Share more about yourself..."></textarea>
      </fieldset>
      

      <button type="button" className={styles.submitButton} onClick={handleBack}>Back</button>
      <button type="submit" className={styles.submitButton}>Continue</button>
    </form>
  );
}
