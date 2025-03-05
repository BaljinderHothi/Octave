import styles from "./styles.module.css";
import { PreferencesForm } from "./PreferencesForm";

export default function SignUpPreferencesPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tell us what you like!</h1>
      <p className={styles.subtitle}>Select your preferences so we can personalize recommendations.</p>
      <PreferencesForm />
    </div>
  );
}
