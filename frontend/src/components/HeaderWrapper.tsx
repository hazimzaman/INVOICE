'use client';

import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";

export default function HeaderWrapper() {
  const { user, signOut } = useAuth();
  return <Header isLoggedIn={!!user} onLogout={signOut} />;
} 