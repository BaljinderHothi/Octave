"use client"; 

import { useState } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import { AuthButtons } from "./AuthButtons";

export function SignInForm() {
  const router = useRouter(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    console.log("Email:", email);
    console.log("Password:", password);
    
    router.push("/HomePage");
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

