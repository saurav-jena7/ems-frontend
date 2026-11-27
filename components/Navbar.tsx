"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getUser, AuthUser } from "@/lib/auth";
import { LogOut, Users } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  // Start as null so server and client both render the same initial HTML.
  // After mount the client reads localStorage and sets the real user.
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2 font-bold text-xl">
        <Users size={24} />
        <span>Employee MS</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-blue-200">
          Welcome,{" "}
          {/* Render nothing until client has hydrated to avoid mismatch */}
          <strong>{user?.name ?? ""}</strong>
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 transition px-3 py-1.5 rounded-md text-sm"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}
