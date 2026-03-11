import { useState, useEffect } from "react";

export type Role =
  | "admin"
  | "manager"
  | "patient"
  | "doctor"
  | "inspector"
  | "user";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Demo hook to simulate authentication and role management
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user from session/API
    const timer = setTimeout(() => {
      // FOR DEMO: Change this to 'doctor' or 'admin' to test different roles
      const mockUser: User = {
        id: "1",
        name: "Trí Trương",
        email: "admin@medimate.com",
        role: "admin", // Demo default role
      };

      // You can also read from localStorage to make it interactive
      const savedUser = localStorage.getItem("medimate_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(mockUser);
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const loginAs = (role: Role) => {
    const mockUser: User = {
      id: "1",
      name: `User ${role}`,
      email: `${role}@medimate.com`,
      role: role,
    };
    localStorage.setItem("medimate_user", JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem("medimate_user");
    setUser(null);
  };

  return { user, loading, loginAs, logout };
}
