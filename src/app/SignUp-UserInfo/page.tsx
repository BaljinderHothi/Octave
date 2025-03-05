import styles from "./styles.module.css";
import { SignUpForm } from "./SignUpForm";

export default function SignUpPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create an Account</h1>
      <SignUpForm />
    </div>
  );
}