"use client"; // Enables client-side interactions in Next.js

import { useState } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import { AuthButtons } from "./AuthButtons";

export function SignInForm() {
  const router = useRouter(); // For navigation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);
    
    // TODO: Implement authentication logic (API call)

    router.push("/dashboard"); // Redirect after login (placeholder)
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

