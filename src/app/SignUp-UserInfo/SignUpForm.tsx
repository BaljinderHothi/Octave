"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";

export function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    dob: { day: "", month: "", year: "" },
    address: "",
    zipCode: "",
    phone: "",
  });

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (!formData.zipCode) {
      alert("Zip Code is required.");
      return;
    }

    localStorage.setItem("userData", JSON.stringify(formData));

    router.push("/SignUp-UserPreference");
  }

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>Email</label>
        <input type="email" name="email" className={styles.input} required onChange={handleInputChange} />

        <label className={styles.label}>Password</label>
        <input type="password" name="password" className={styles.input} required onChange={handleInputChange} />

        <label className={styles.label}>Confirm Password</label>
        <input type="password" name="confirmPassword" className={styles.input} required onChange={handleInputChange} />

        <label className={styles.label}>Zip Code</label>
        <input type="text" name="zipCode" className={styles.input} required onChange={handleInputChange} />

        <button type="submit" className={styles.signUpButton}>Continue</button>
      </form>
    </div>
  );
}
