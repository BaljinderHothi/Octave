import styles from "./styles.module.css";
import Link from "next/link";

export function AuthButtons() {
  return (
    <div className={styles.authButtons}>
      <Link href="/SignUp" className={`${styles.button} ${styles.register}`}>
        Register
      </Link>
    </div>
  );
}


