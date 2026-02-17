import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  FileText,
  Smartphone,
  CheckCircle2,
  Building2,
  Users,
  HeartHandshake,
  Sparkles,
  Brain,
  Zap,
  CreditCard,
} from "lucide-react";
import Newsletter from "@/components/layout/Newsletter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-50 via-white to-indigo-50 pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02]" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              Digital Referrals.{" "}
              <span className="text-blue-600">Faster Care.</span> Better
              Outcomes.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
              Eliminate paper-based delays. Track referrals in real-time. Ensure
              continuity of care across Kenyan facilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started{" "}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 border-gray-300 hover:border-blue-600 text-white hover:text-blue-600 bg-accent"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-xs sm:text-sm text-gray-500 px-4">
              Built for physicians, administrators, and healthcare facilities •
              Powered by secure Kenyan digital infrastructure •{" "}
              <span className="inline-flex items-center gap-1 font-medium text-blue-600">
                <Sparkles className="h-3 w-3" /> AI-enhanced workflows
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 sm:py-20 md:py-32 bg-linear-to-br from-blue-50/50 via-white to-indigo-50/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">
                AI-Powered Intelligence
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
              Smarter Referrals with AI
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our AI engine processes patient data instantly, saving physicians
              time and improving accuracy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4 sm:mb-6">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                AI Summarization
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Upload clinical notes, lab results, or voice recordings. Our AI
                generates concise summaries for receiving physicians.
              </p>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4 sm:mb-6">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Smart Matching
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                AI suggests the best receiving facility based on specialty,
                distance, and availability.
              </p>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-4 sm:mb-6">
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Predictive Analytics
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Identify referral patterns, predict bottlenecks, and optimize
                resource allocation across facilities.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
              Why UzimaCare?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Solving real problems in Kenya's referral system with modern,
              accessible technology.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4 sm:mb-6">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Faster Referrals
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Replace paper with instant digital referrals — reduce wait from
                days to minutes.
              </p>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4 sm:mb-6">
                <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Secure & Compliant
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                End-to-end encryption. Compliant with Kenyan health data
                regulations.
              </p>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-center sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4 sm:mb-6">
                <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Mobile-First
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Works on any device. STK push payments. USSD fallback for
                low-connectivity areas.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-16 sm:py-20 md:py-32 bg-linear-to-b from-white to-gray-50"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Simple, secure, and efficient workflow from referral creation to
              patient arrival.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Physician Creates Referral",
                desc: "Enter patient details, history, diagnosis. AI assists with summarization.",
                icon: FileText,
                color: "blue",
              },
              {
                step: "2",
                title: "Admin Reviews & Books",
                desc: "Add biodata, book slot, send STK prompt.",
                icon: Clock,
                color: "amber",
              },
              {
                step: "3",
                title: "Patient Pays & Confirms",
                desc: "Receive M-Pesa push. Payment confirms instantly.",
                icon: CreditCard,
                color: "emerald",
              },
              {
                step: "4",
                title: "Seamless Care Delivery",
                desc: "Patient arrives with full digital record, AI-summarized for quick review.",
                icon: ShieldCheck,
                color: "purple",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 p-6 h-full flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-${item.color}-100 flex items-center justify-center mb-3 sm:mb-4 text-${item.color}-600 font-bold text-base sm:text-xl`}
                  >
                    {item.step}
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-${item.color}-600 mb-3 sm:mb-4`}
                  >
                    <item.icon className="w-full h-full" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {item.desc}
                  </p>
                </Card>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-linear-to-r from-blue-200 to-indigo-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPDATED PRICING SECTION - B2B & B2C */}
      <section id="pricing" className="py-16 sm:py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Affordable plans for healthcare facilities and patients.
            </p>
          </div>

          {/* B2B - Hospital/Facility Plans */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-2">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">B2B</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                For Healthcare Facilities
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Annual contracts • Volume discounts available
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {/* Small Clinic */}
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div className="p-6 sm:p-8 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
                    Small Clinic
                  </h3>
                  <p className="text-3xl sm:text-4xl font-bold mb-1 text-blue-600">
                    KSh 25K
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                    per year
                  </p>

                  <ul className="space-y-3 sm:space-y-4 text-left mb-6 sm:mb-8">
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
                      <span>Up to 5 physicians</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
                      <span>200 referrals/month</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
                      <span>Basic AI summarization</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500 shrink-0" />
                      <span>Email support</span>
                    </li>
                  </ul>

                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 hover:border-blue-600 text-blue-600 hover:text-blue-600 bg-white"
                    >
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Sub-County Hospital - Most Popular */}
              <Card className="border-2 border-blue-600 shadow-2xl relative overflow-hidden scale-105 z-10">
                <div className="absolute top-0 inset-x-0 bg-blue-600 text-white text-xs sm:text-sm font-semibold py-1.5 sm:py-2 text-center">
                  Most Popular
                </div>
                <div className="p-6 sm:p-8 text-center pt-12 sm:pt-14">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
                    Sub-County Hospital
                  </h3>
                  <p className="text-3xl sm:text-4xl font-bold mb-1 text-blue-600">
                    KSh 75K
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                    per year
                  </p>

                  <ul className="space-y-3 sm:space-y-4 text-left mb-6 sm:mb-8">
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                      <span>Up to 25 physicians</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                      <span>750 referrals/month</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                      <span>Advanced AI summarization</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                      <span>Priority phone support</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                      <span>Analytics dashboard</span>
                    </li>
                  </ul>

                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 hover:border-indigo-600 text-blue-600 hover:text-indigo-600 bg-white"
                    >
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* County Hospital */}
              <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Unlimited
                </div>
                <div className="p-6 sm:p-8 text-center">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
                    County Hospital
                  </h3>
                  <p className="text-3xl sm:text-4xl font-bold mb-1 text-indigo-600">
                    KSh 150K
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                    per year
                  </p>

                  <ul className="space-y-3 sm:space-y-4 text-left mb-6 sm:mb-8">
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
                      <span>Unlimited physicians</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
                      <span>Unlimited referrals</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
                      <span>Premium AI features</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
                      <span>Dedicated account manager</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 shrink-0" />
                      <span>Custom integrations</span>
                    </li>
                  </ul>

                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 hover:border-indigo-600 text-indigo-600 hover:text-indigo-600 bg-white"
                    >
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* B2C - Patient Payment Model */}
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">B2C</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                For Patients
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Pay-per-referral model
              </p>
            </div>

            <Card className="border-2 border-purple-600 shadow-xl overflow-hidden">
              <div className="p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full mb-4">
                  <CreditCard className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800">
                  Referral Token
                </h3>
                <p className="text-4xl sm:text-5xl font-bold text-purple-600 mb-1">
                  KSh 150
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                  per referral
                </p>

                <p className="text-base sm:text-lg mb-4 sm:mb-6 max-w-md mx-auto text-gray-700">
                  One-time payment covers:
                </p>

                <ul className="space-y-2 sm:space-y-3 text-left max-w-sm mx-auto mb-6 sm:mb-8">
                  <li className="flex items-center gap-2 sm:gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
                    <span>
                      <strong>AI summarization</strong> of your medical records
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
                    <span>
                      <strong>Physician review</strong> and referral processing
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
                    <span>
                      <strong>Digital referral</strong> to receiving facility
                    </span>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 shrink-0" />
                    <span>
                      <strong>SMS/Email updates</strong> on referral status
                    </span>
                  </li>
                </ul>

                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                  Pay via M-Pesa STK push at the time of referral creation.
                </p>

                <Link href="/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started as a Patient
                  </Button>
                </Link>
              </div>
            </Card>

            <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
              NHIF and insurance covers accepted where available • Receipts
              provided for claims
            </p>
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Need a custom enterprise plan for your county or large network? We
              offer special rates.
            </p>
            <Link href="/contact">
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-700"
              >
                Talk to our team →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section id="partnerships" className="py-16 sm:py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">
              Partnerships & Collaboration
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We're actively seeking partners to scale digital referrals across
              Kenya.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <Card className="p-6 sm:p-8 text-center border-none shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4 sm:mb-6">
                <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Hospitals & Clinics
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Join as a referring or receiving facility. Pilot free for 3
                months.
              </p>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 bg-white"
                >
                  Partner as a Facility
                </Button>
              </Link>
            </Card>

            <Card className="p-6 sm:p-8 text-center border-none shadow-lg hover:shadow-xl transition-all">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4 sm:mb-6">
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                Counties & Government
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Integrate with county health systems. Special pricing and
                support.
              </p>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:border-emerald-600 text-gray-700 hover:text-emerald-600 bg-white"
                >
                  Government Partnership
                </Button>
              </Link>
            </Card>

            <Card className="p-6 sm:p-8 text-center border-none shadow-lg hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center mb-4 sm:mb-6">
                <HeartHandshake className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">
                NGOs & Tech Partners
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Co-develop features, integrate APIs, or co-fund rural pilots.
              </p>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 bg-white"
                >
                  Become a Partner
                </Button>
              </Link>
            </Card>
          </div>

          <div className="text-center mt-12 sm:mt-16">
            <p className="text-base sm:text-lg md:text-xl font-medium mb-4 sm:mb-6 text-gray-800">
              Let's build a stronger referral network together.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-6 sm:px-8"
              >
                Get in Touch →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 md:py-32 bg-linear-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Ready to Transform Referrals?
          </h2>
          <p className="text-base sm:text-lg md:text-xl opacity-90 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
            Join facilities already using UzimaCare to deliver faster, safer,
            and more coordinated care with AI-powered intelligence.
          </p>

          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="text-base sm:text-lg px-6 sm:px-8 py-6 sm:py-7 text-blue-700 bg-white hover:bg-gray-100"
            >
              Create Your Account Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
