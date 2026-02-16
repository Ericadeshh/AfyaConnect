import Link from "next/link";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Code2,
  UserCog,
  Laptop,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="py-16 md:py-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-primary">UZIMA</span>
                <span className="text-foreground">CARE</span>
              </span>
            </Link>

            <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
              Secure, real-time digital referral platform empowering healthcare
              facilities across Kenya to deliver faster, safer, and more
              coordinated patient care.
            </p>

            {/* AI Dashboard Link */}
            <Link
              href="/dashboard/ai-dashboard"
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg mb-6 hover:bg-primary/20 transition-all duration-300 group"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                AI-Powered Summarization
              </span>
            </Link>

            {/* Social icons */}
            <div className="flex items-center gap-5">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:hello@uzimacare.ke"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-6">
              Platform
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/#features"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              {/* AI Dashboard Link */}
              <li>
                <Link
                  href="/dashboard/ai-dashboard"
                  className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="h-3 w-3" />
                  AI Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-6">
              Company
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/partnerships"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Partnerships
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-6">
              Legal & Support
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/data-protection"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Data Protection
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@uzimacare.ke"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t py-8 text-center text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              © {currentYear} UzimaCare by AfyaConnect. All rights reserved.
            </div>

            <div className="flex items-center gap-4">
              {/* Developer credit - with technician icon */}
              <span className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full">
                <UserCog className="h-3.5 w-3.5 text-primary" />
                <span>Built by</span>
                <span className="text-xs text-primary">
                  AfyaConnect(E.L, M.M)
                </span>
              </span>

              <span className="text-xs text-muted-foreground">|</span>

              <span className="flex items-center gap-1.5">
                <span className="text-xs">For</span>
                <span className="text-primary font-medium bg-primary/5 px-2 py-1 rounded-full text-xs">
                  Red White & Build U.S-Kenya Hackathon
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
