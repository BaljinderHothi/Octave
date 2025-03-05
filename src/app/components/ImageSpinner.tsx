"use client";

import React, { useEffect, useState } from "react";

export default function ImageSpinner() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch("/api/images"); 
        const data = await res.json();
        setImages(data);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * images.length);
      setCurrentIndex(randomIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) {
    return <div>Loading images...</div>;
  }

  const currentImage = `/ui-images/food/${images[currentIndex]}`;

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <img
        src={currentImage}
        alt="Random Food"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}
