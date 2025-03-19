"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";

type PreferencesState = {
  food: string[];
  activities: string[];
  places: string[];
  custom: string[];
};

type UserData = {
  firstName: string,
  lastName: string,
  username: string,
  email: string;
  password: string;
  dob: { day: string; month: string; year: string };
  zipCode: string;
  phone?: string;
};

export function PreferencesForm() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<PreferencesState>({
    food: [],
    activities: [],
    places: [],
    custom: [],
  });
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    }
  }, []);

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
      const newValue = inputElement.value.trim();
      if (newValue !== "") {
        setPreferences((prev) => ({
          ...prev,
          [category]: [...prev[category], newValue],
        }));
        inputElement.value = "";
      }
    }
  }

  function handleRemoveTag(category: keyof PreferencesState, item: string) {
    setPreferences((prev) => {
      const updatedCategory = prev[category].filter((i) => i !== item);
      return { ...prev, [category]: updatedCategory };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!userData) {
      alert("User data is missing. Please restart the signup process.");
      router.push("/SignUp-UserInfo");
      return;
    }

    const completeUserData = {
      ...userData,
      preferences,
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeUserData),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok && result.success) {
        alert("Registration complete!");
        localStorage.removeItem("userData");
        router.push("/HomePage");
      } else {
        console.error("Error response from API:", result);
        alert(`Error: ${result.message || "Registration failed. Please try again."}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("An error occurred while registering. Please try again.");
    }
  }

  function handleBack() {
    router.push("/SignUp-UserInfo");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Food Preferences */}
      <fieldset className={styles.category}>
        <legend>Food Preferences:</legend>
        <p>Favorite cuisines and dishes? You can add more in &quot;Other&quot;!</p>
        {["Italian", "Mexican", "Sushi", "BBQ", "Vegan", "Fast Food", "Pizza", "Indian", "Latin Fusion"].map((food) => (
          <label key={food}>
            <input
              type="checkbox"
              onChange={() => handleCheckboxChange("food", food)}
              checked={preferences.food.includes(food)}
            />
            {food}
          </label>
        ))}
        <input
          type="text"
          placeholder="Other (Type and press Enter)"
          onKeyDown={(e) => handleCustomInput("food", e)}
          className={styles.input}
        />
        <div className={styles.tags}>
          {preferences.food.map((item, index) => (
            <span key={index} className={styles.tag}>
              {item}{" "}
              <button
                type="button"
                className={styles.tagRemove}
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveTag("food", item);
                }}
              >
                ✖
              </button>
            </span>
          ))}
        </div>
      </fieldset>

      {/* Activities Preferences */}
      <fieldset className={styles.category}>
        <legend>Activities:</legend>
        <p>What activities do you enjoy? You can add more in &quot;Other&quot;!</p>
        {["Bowling", "Billiards", "Rock Climbing", "Night Life", "Movies", "Running", "Swimming", "Yoga", "Dancing"].map((activity) => (
          <label key={activity}>
            <input
              type="checkbox"
              onChange={() => handleCheckboxChange("activities", activity)}
              checked={preferences.activities.includes(activity)}
            />
            {activity}
          </label>
        ))}
        <input
          type="text"
          placeholder="Other (Type and press Enter)"
          onKeyDown={(e) => handleCustomInput("activities", e)}
          className={styles.input}
        />
        <div className={styles.tags}>
          {preferences.activities.map((item, index) => (
            <span key={index} className={styles.tag}>
              {item}{" "}
              <button
                type="button"
                className={styles.tagRemove}
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveTag("activities", item);
                }}
              >
                ✖
              </button>
            </span>
          ))}
        </div>
      </fieldset>

      {/* Places to Visit */}
      <fieldset className={styles.category}>
        <legend>Places to Visit:</legend>
        <p>Favorite places to visit? You can add more in &quot;Other&quot;!</p>
        {["Museums", "Parks", "Zoos", "Landmarks", "Tourist Attractions", "Beaches", "Theaters", "Malls", "Libraries"].map((place) => (
          <label key={place}>
            <input
              type="checkbox"
              onChange={() => handleCheckboxChange("places", place)}
              checked={preferences.places.includes(place)}
            />
            {place}
          </label>
        ))}
        <input
          type="text"
          placeholder="Other (Type and press Enter)"
          onKeyDown={(e) => handleCustomInput("places", e)}
          className={styles.input}
        />
        <div className={styles.tags}>
          {preferences.places.map((item, index) => (
            <span key={index} className={styles.tag}>
              {item}{" "}
              <button
                type="button"
                className={styles.tagRemove}
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveTag("places", item);
                }}
              >
                ✖
              </button>
            </span>
          ))}
        </div>
      </fieldset>

      {/* Additional Information */}
      <fieldset className={styles.category}>
        <legend>Tell Us More!:</legend>
        <p>
          Did we miss anything? Feel free to write anything you&apos;d like us to know about you. This will help train our model for better recommendations.
        </p>
        <textarea className={styles.textarea} placeholder="Share more about yourself..."></textarea>
      </fieldset>

      <div className={styles.buttons}>
        <button type="button" className={styles.submitButton} onClick={handleBack}>
          Back
        </button>
        <button type="submit" className={styles.submitButton}>
          Continue
        </button>
      </div>
    </form>
  );
}