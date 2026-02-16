"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/#features", scroll: true },
  { label: "How It Works", href: "/#how-it-works", scroll: true },
  { label: "Pricing", href: "/#pricing", scroll: true },
  { label: "Partnerships", href: "/#partnerships", scroll: true },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, isLoading, signOut } = useAuth();

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(href);
  };

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return "/dashboard";
    switch (user.role) {
      case "admin":
        return "/dashboard/admin";
      case "physician":
        return "/dashboard/physician";
      case "patient":
        return "/dashboard/patient";
      default:
        return "/dashboard";
    }
  };

  // Use user.name instead of user.fullName
  const getUserInitial = () => {
    if (!user?.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user?.name) return "User";
    return user.name;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-lg supports-backdrop-filter:bg-white/60 transition-all duration-300 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105 duration-300"
          >
            <div className="relative w-7 h-7 sm:w-8 sm:h-8">
              {!logoError ? (
                <Image
                  src="/images/logo.jpg"
                  alt="UzimaCare Logo"
                  fill
                  className="object-contain rounded-full"
                  onError={() => setLogoError(true)}
                  priority
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  U
                </div>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                UZIMA
              </span>
              <span className="text-lg sm:text-xl font-bold text-gray-800">
                CARE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden xl:flex items-center gap-4 xl:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-xs xl:text-sm font-medium transition-all duration-300 hover:text-blue-600",
                  isActive(item.href)
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600",
                )}
                onClick={() => {
                  if (item.scroll) {
                    setTimeout(() => {
                      document
                        .getElementById(item.href.replace("#", ""))
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }, 100);
                  }
                }}
              >
                {item.label}
              </Link>
            ))}

            {/* UzimaCare AI link */}
            <Link
              href="/dashboard/ai-dashboard"
              className="text-xs xl:text-sm font-medium flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-all duration-300"
            >
              <Sparkles className="h-3 w-3 xl:h-4 xl:w-4" />
              <span className="hidden xl:inline">UzimaCare AI</span>
              <span className="xl:hidden">AI</span>
            </Link>
          </nav>

          {/* Auth / Profile Section – Desktop */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-2 lg:gap-3">
                <Link href={getDashboardUrl()}>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs lg:text-sm px-3 lg:px-4"
                  >
                    Dashboard
                  </Button>
                </Link>

                {/* Profile Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-1 lg:gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-7 h-7 lg:w-8 lg:h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
                      {getUserInitial()}
                    </div>
                    <ChevronDown
                      className={`w-3 h-3 lg:w-4 lg:h-4 text-gray-600 transition-transform duration-200 ${
                        profileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link href="/profile" className="block">
                          <button
                            onClick={() => setProfileMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </button>
                        </Link>

                        <div className="border-t border-gray-100 my-1"></div>

                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            signOut();
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs lg:text-sm px-4 lg:px-6"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle - visible on tablet and below */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-gray-600" />
            ) : (
              <Menu className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu – slide down */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm py-3 px-4 rounded-lg transition-all duration-200",
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50",
                  )}
                  onClick={() => {
                    setMobileOpen(false);
                    if (item.scroll) {
                      setTimeout(() => {
                        document
                          .getElementById(item.href.replace("#", ""))
                          ?.scrollIntoView({
                            behavior: "smooth",
                          });
                      }, 150);
                    }
                  }}
                >
                  {item.label}
                </Link>
              ))}

              {/* UzimaCare AI in mobile */}
              <Link
                href="/dashboard/ai-dashboard"
                className="text-sm py-3 px-4 rounded-lg flex items-center gap-2 text-blue-600 hover:bg-blue-50 transition-all duration-200"
                onClick={() => setMobileOpen(false)}
              >
                <Sparkles className="h-4 w-4" />
                UzimaCare AI
              </Link>

              {/* Mobile Auth Section */}
              <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-gray-200">
                {isLoading ? (
                  <div className="text-center py-2 text-gray-500">
                    Loading...
                  </div>
                ) : user ? (
                  <>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      href={getDashboardUrl()}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        signOut();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
