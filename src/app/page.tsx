import { Button } from "@/components/ui/button";
import Image from "next/image";
import { WishList } from "@/components/WishList";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { LoginMenu } from "@/components/LoginMenu";
import { StatsSection } from "@/components/StatsSection";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FDF8F4]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-[#E86C3A]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#0A2540]">Box of Hope</h1>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[#0A2540]">
          <Link href="/" className="hover:text-[#E86C3A]">Home</Link>
          <Link href="/community-wishes" className="hover:text-[#E86C3A]">Community Wishes</Link>
          <a href="#how-it-works" className="hover:text-[#E86C3A] cursor-pointer">How It Works</a>
        </div>
        <div className="flex items-center gap-4">
          <LoginMenu />
          <Link href="/register?type=donor">
            <Button 
              className="bg-[#E86C3A] hover:bg-[#D55C2A] text-white group relative overflow-hidden cursor-pointer"
            >
              <span className="relative z-10">Let&apos;s Donate</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#D55C2A] to-[#E86C3A] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="text-center md:text-left">
          <TypewriterEffect
            words={[
              {
                text: "Community",
                className: "text-[#0A2540]",
              },
              {
                text: "Wishlist",
                className: "text-[#E86C3A]",
              },
              {
                text: "Platform",
                className: "text-[#0A2540]",
              },
            ]}
            className="text-5xl md:text-6xl font-bold leading-tight mb-6"
            cursorClassName="bg-[#E86C3A]"
          />
          <p className="text-xl text-gray-600 mb-8 text-center">
            Donate goods to fulfill specific needs in your local community.
          </p>
          <div className="flex justify-center">
            <Link href="/community-wishes">
              <Button 
                className="bg-[#E86C3A] hover:bg-[#D55C2A] text-white text-lg px-8 py-6 group relative overflow-hidden"
              >
                <span className="relative z-10">View Wishes</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#D55C2A] to-[#E86C3A] transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative h-[400px]">
          <Image
            src="/donation.png"
            alt="Community donation illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Wishes Section */}
      <WishList />

      {/* Footer */}
      <Footer />
    </main>
  );
}
