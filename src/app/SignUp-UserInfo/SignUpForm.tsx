"use client"; 

import { useState } from "react";
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

  function handleDOBChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      dob: { ...prev.dob, [name]: value },
    }));
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

    console.log("User Info:", formData);

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

        <label className={styles.label}>Date of Birth</label>
        <div className={styles.dobContainer}>
          <select name="day" className={styles.dropdown} onChange={handleDOBChange}>
            <option value="">Day</option>
            {[...Array(31)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          <select name="month" className={styles.dropdown} onChange={handleDOBChange}>
            <option value="">Month</option>
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => (
              <option key={i + 1} value={i + 1}>{month}</option>
            ))}
          </select>
          <select name="year" className={styles.dropdown} onChange={handleDOBChange}>
            <option value="">Year</option>
            {[...Array(127)].map((_, i) => (
              <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
            ))}
          </select>
        </div>

        <label className={styles.label}>Address (Optional)</label>
        <input type="text" name="address" className={styles.input} onChange={handleInputChange} />

        <label className={styles.label}>Zip Code</label>
        <input type="text" name="zipCode" className={styles.input} required onChange={handleInputChange} />

        <label className={styles.label}>Phone Number (Optional)</label>
        <input type="tel" name="phone" className={styles.input} onChange={handleInputChange} />

        <button type="submit" className={styles.signUpButton}>Continue</button>
      </form>
    </div>
  );
}
