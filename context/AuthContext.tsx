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
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  hospital?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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
  hospital?: string;
}

// User-friendly error messages
const getFriendlyErrorMessage = (error: any): string => {
  const message = error?.message || error?.data?.message || String(error);

  if (message.includes("No account found")) {
    return "No account found with this email address. Please sign up first.";
  }
  if (message.includes("registered as")) {
    return message; // Already friendly: "This account is registered as a [role]"
  }
  if (message.includes("password is incorrect")) {
    return "The password you entered is incorrect. Please try again.";
  }
  if (message.includes("deactivated")) {
    return "This account has been deactivated. Please contact support.";
  }
  if (message.includes("already exists")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (message.includes("network") || message.includes("Network")) {
    return "Network error. Please check your internet connection and try again.";
  }
  if (message.includes("timeout") || message.includes("Timeout")) {
    return "Request timed out. Please try again.";
  }

  // Default message
  return "Something went wrong. Please try again.";
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const signInAction = useAction(api.auth.actions.signInWithCrypto);
  const signUpAction = useAction(api.auth.actions.signUpWithCrypto);
  const signOutMutation = useMutation(api.auth.mutations.signOut);
  const validateSessionMutation = useMutation(
    api.auth.mutations.validateSession,
  );

  useEffect(() => {
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

  const signIn = async (email: string, password: string) => {
    try {
      // We need to determine the role - we'll try patient first, then physician
      // This is a workaround since we removed role from login form
      let result;
      let lastError;

      // Try patient first
      try {
        result = await signInAction({
          email,
          password,
          role: "patient",
        });
      } catch (error) {
        lastError = error;
        // If patient fails, try physician
        try {
          result = await signInAction({
            email,
            password,
            role: "physician",
          });
        } catch (error) {
          lastError = error;
          // If physician fails, try admin (though admin login is restricted)
          try {
            result = await signInAction({
              email,
              password,
              role: "admin",
            });
          } catch (error) {
            lastError = error;
            throw lastError;
          }
        }
      }

      if (result && result.success) {
        localStorage.setItem("authToken", result.token);
        setUser(result.user);
        setToken(result.token);
        redirectToDashboard(result.user.role);
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw new Error(getFriendlyErrorMessage(error));
    }
  };

  const signUp = async (userData: SignUpData) => {
    try {
      const result = await signUpAction(userData);

      if (result.success) {
        localStorage.setItem("authToken", result.token);
        setUser(result.user);
        setToken(result.token);
        redirectToDashboard(result.user.role);
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw new Error(getFriendlyErrorMessage(error));
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

// Export useAuth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
