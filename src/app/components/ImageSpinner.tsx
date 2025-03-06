"use client";
import React, { useState, useEffect } from "react";
import styles from "../SignUp-Userinfo/styles.module.css";

export default function ImageSpinner() {
  const images = [
    "/ui-images/food/188_chuchifritos_43.7.jpg",
    "/ui-images/food/220827_GuangXu_BA-UncleLou_234.jpg",
    "/ui-images/food/celeriac-gotham_1021_nf_1.jpeg",
    "/ui-images/food/diner-24-burger-7.jpg",
    "/ui-images/food/Tatiana_Everything_DavidALee_NYC_2_jh1d2r.jpg"
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [images.length]);
  
  return (
    <div className={styles.imageWrapper}>
      <img
        src={images[currentIndex]}
        alt="Food or Restaurant"
        className={styles.spinnerImage}
      />
    </div>
  );
}