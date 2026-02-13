import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "physician" | "patient";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string, role: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: "admin" | "physician" | "patient";
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Use actions for crypto operations
  const signInAction = useAction(api.auth.actions.signInWithCrypto);
  const signUpAction = useAction(api.auth.actions.signUpWithCrypto);

  // Use mutations for non-crypto operations
  const signOutMutation = useMutation(api.auth.mutations.signOut);
  const validateSessionMutation = useMutation(
    api.auth.mutations.validateSession,
  );

  useEffect(() => {
    // Check for existing session on mount
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      validateSessionMutation({ token: storedToken })
        .then((result) => {
          if (result.isValid && result.user) {
            setUser(result.user);
            setToken(storedToken);
          } else {
            localStorage.removeItem("authToken");
          }
        })
        .catch((error) => {
          console.error("Session validation error:", error);
          localStorage.removeItem("authToken");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [validateSessionMutation]);

  const signIn = async (email: string, password: string, role: string) => {
    try {
      const result = await signInAction({
        email,
        password,
        role: role as "admin" | "physician" | "patient",
      });

      if (result.success) {
        localStorage.setItem("authToken", result.token);
        setUser(result.user);
        setToken(result.token);

        // Redirect based on role
        redirectToDashboard(result.user.role);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (userData: SignUpData) => {
    try {
      const result = await signUpAction(userData);

      if (result.success) {
        localStorage.setItem("authToken", result.token);
        setUser(result.user);
        setToken(result.token);

        // Redirect based on role
        redirectToDashboard(result.user.role);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (token) {
      try {
        await signOutMutation({ token });
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }

    localStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case "admin":
        router.push("/dashboard/admin");
        break;
      case "physician":
        router.push("/dashboard/physician");
        break;
      case "patient":
        router.push("/dashboard/patient");
        break;
      default:
        router.push("/dashboard");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
