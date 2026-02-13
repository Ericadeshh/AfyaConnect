"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

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

  // Use our custom auth hook instead of useConvexAuth
  const { user, isLoading, signOut } = useAuth();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/60 transition-all duration-300">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold text-xl tracking-tight transition-transform hover:scale-105 duration-300"
        >
          <span className="text-primary">UZIMA</span>
          <span className="text-foreground">CARE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-all duration-300 hover:text-primary hover:scale-105",
                isActive(item.href)
                  ? "text-primary font-semibold scale-105"
                  : "text-muted-foreground",
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
            className="text-sm font-medium flex items-center gap-1.5 text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="h-4 w-4" />
            UzimaCare AI
          </Link>
        </nav>

        {/* Auth / CTA Buttons – Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <span className="text-sm text-muted-foreground animate-pulse">
              Loading...
            </span>
          ) : user ? (
            <>
              <Link href={getDashboardUrl()}>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-md"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                className="bg-linear-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 transition-all duration-300 hover:shadow-lg"
              >
                Account
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-full hover:bg transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu – scrollable */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-lg max-h-[90vh] overflow-y-auto">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:bg-accent hover:text-primary",
                  isActive(item.href)
                    ? "bg-accent/80 text-primary font-semibold"
                    : "text-muted-foreground",
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
              className="text-base font-medium py-3 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 hover:bg-accent hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              <Sparkles className="h-5 w-5" />
              UzimaCare AI
            </Link>

            <div className="flex flex-col gap-4 pt-6 border-t">
              {isLoading ? (
                <span className="text-center text-muted-foreground animate-pulse">
                  Loading...
                </span>
              ) : user ? (
                <>
                  <Link
                    href={getDashboardUrl()}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button className="w-full bg-primary hover:bg-primary/90 transition-all duration-300">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-linear-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 transition-all duration-300">
                    Account
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
