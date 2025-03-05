
"use client";

import React, { useState, useEffect } from "react";

export default function ImageSpinner() {

  const images = [
    '/ui-images/signup-and-login/images.jpeg',
    '/ui-images/signup-and-login/images-2.jpeg',
    '/ui-images/signup-and-login/images-3.jpeg',
    '/ui-images/signup-and-login/photo-1551024601-bec78aea704b.avif',
    '/ui-images/signup-and-login/premium_photo-1669742928112-19364a33b530.jpeg',
    '/ui-images/signup-and-login/Screenshot 2024-08-22 at 12.08.20 PM.png.webp',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // switch every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <img
        src={images[currentIndex]}
        alt="Food or Restaurant"
        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
      />
    </div>
  );
}
