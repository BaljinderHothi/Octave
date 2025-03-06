import styles from "./styles.module.css";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.brandTitle}>OCTAVE</h1>
      <h2 className={styles.title}>Welcome back!</h2>
      <SignInForm />
    </div>
  );
}

