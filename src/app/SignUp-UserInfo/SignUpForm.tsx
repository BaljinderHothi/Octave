"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.css";

export function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: { day: "", month: "", year: "" },
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
    if (!formData.dob.day || !formData.dob.month || !formData.dob.year) {
      alert("Please select your date of birth.");
      return;
    }

    console.log("User Info:", formData);
    localStorage.setItem("userData", JSON.stringify(formData));

    router.push("/SignUp-UserPreference");
  }

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* First Name & Last Name */}
        <div className={styles.nameContainer}>
          <div>
            <label className={styles.label}>First Name</label>
            <input type="text" name="firstName" className={styles.input} required onChange={handleInputChange} />
          </div>
          <div>
            <label className={styles.label}>Last Name</label>
            <input type="text" name="lastName" className={styles.input} required onChange={handleInputChange} />
          </div>
        </div>

        {/* Username */}
        <label className={styles.label}>Username</label>
        <input type="text" name="username" className={styles.input} required onChange={handleInputChange} />

        {/* Email */}
        <label className={styles.label}>Email</label>
        <input type="email" name="email" className={styles.input} required onChange={handleInputChange} />

        {/* Password */}
        <label className={styles.label}>Password</label>
        <input type="password" name="password" className={styles.input} required onChange={handleInputChange} />

        {/* Confirm Password */}
        <label className={styles.label}>Confirm Password</label>
        <input type="password" name="confirmPassword" className={styles.input} required onChange={handleInputChange} />

        {/* Date of Birth */}
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

        {/* Zip Code */}
        <label className={styles.label}>Zip Code</label>
        <input type="text" name="zipCode" className={styles.input} required onChange={handleInputChange} />

        {/* Phone Number */}
        <label className={styles.label}>Phone Number (Optional)</label>
        <input type="tel" name="phone" className={styles.input} onChange={handleInputChange} />

        {/* Continue Button */}
        <button type="submit" className={styles.signUpButton}>Continue</button>
      </form>
    </div>
  );
}
