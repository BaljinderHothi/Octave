import { SignUpForm } from "./SignUpForm";
import styles from "./styles.module.css";


import ImageSpinner from "@/app/components/ImageSpinner";
import DarkModeToggle from "@/app/components/DarkModeToggle";

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <DarkModeToggle />
      </header>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <ImageSpinner />
        </div>

        <div className={styles.formSection}>
          <h1 className={styles.title}>Create an Account</h1>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
