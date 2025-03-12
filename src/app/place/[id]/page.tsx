"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import Next.js Image
import styles from "./PlaceDetails.module.css";

interface Place {
  id: string;
  name: string;
  address: string;
  hours: string;
  phone: string;
  description: string;
  reviews: { title: string; rating: number; text: string; user: string }[];
}

const placeDetails: Record<string, Place> = {
  "1": {
    id: "1",
    name: "Cafe One",
    address: "1619 Amsterdam Ave, New York, NY 10031",
    hours: "Open • Closes 6 PM",
    phone: "(212) 690-0060",
    description: "Cool, casual coffee bar near City College serving breakfast & light fare.",
    reviews: [
      { title: "Fun spot.", rating: 5, text: "The food was great and freshly made.", user: "John" },
      { title: "Wait was a bit long.", rating: 3, text: "I ordered on Seamless and picked it up.", user: "Jane" }
    ]
  }
};

export default function PlaceDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [placeData, setPlaceData] = useState<Place | null>(null);

  useEffect(() => {
    if (!id) return;

    setPlaceData(placeDetails[id]);
  }, [id]);

  if (!placeData) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← Go back
      </button>

      <Image
        src="/ui-images/cafeone.jpg" 
        alt={`${placeData.name} Image`}
        width={400} 
        height={300} 
        className={styles.image} 
      />

      <h1 className={styles.title}>{placeData.name}</h1>
      <p>{placeData.description}</p>

      <div className={styles.details}>
        <p><strong>Address:</strong> {placeData.address}</p>
        <p><strong>Hours:</strong> {placeData.hours}</p>
        <p><strong>Phone:</strong> {placeData.phone}</p>
      </div>

      <div className={styles.reviews}>
        <h2>Reviews</h2>
        {placeData.reviews.map((review, index) => (
          <div key={index} className={styles.review}>
            <p><strong>{review.title}</strong></p>
            <p>{"⭐".repeat(review.rating)}</p>
            <p>{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
