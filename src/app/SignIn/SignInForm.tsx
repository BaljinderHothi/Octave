"use client"; 

import { useState } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import { AuthButtons } from "./AuthButtons";

export function SignInForm() {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (response.ok && result.success) {
        alert("Sign in successful!");
        router.push("/HomePage");
      } else {
        alert(`Error: ${result.message || "Sign in failed."}`);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      alert("An error occurred. Please try again.");
    }
  }

  return (
    <div className={styles.formContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          className={styles.input}
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className={styles.label}>Password</label>
        <input
          type="password"
          className={styles.input}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className={styles.signInButton}>
          Sign In
        </button>
      </form>

      <AuthButtons />
    </div>
  );
}

