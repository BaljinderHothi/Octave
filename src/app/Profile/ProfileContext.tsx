//context file 

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ProfileContextType {
  bio: string;
  profilePic: string;
  setBio: (bio: string) => void;
  setProfilePic: (pic: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [bio, setBio] = useState("I love Italian and Chinese cuisine. In my free time, I enjoy rock climbing, walking trails, and going to concerts.");
  const [profilePic, setProfilePic] = useState("/profile-pic.jpg");

  return (
    <ProfileContext.Provider value={{ bio, profilePic, setBio, setProfilePic }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within a ProfileProvider");
  return context;
}
