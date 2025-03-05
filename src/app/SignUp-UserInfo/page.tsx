import styles from "./styles.module.css";
import { SignUpForm } from "./SignUpForm";
import ImageSpinner from "@/app/components/ImageSpinner"; // or the correct path to ImageSpinner

export default function SignUpPage() {
  return (
    <div className={styles.signUpContainer}>
     
      <div className={styles.leftSide}>
        <ImageSpinner />
      </div>

     
      <div className={styles.rightSide}>
        <h1 className={styles.title}>Create an Account</h1>
        <SignUpForm />
      </div>
    </div>
  );
}
