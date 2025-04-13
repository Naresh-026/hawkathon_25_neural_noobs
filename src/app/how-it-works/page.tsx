import { IconGift, IconHeart, IconTruck, IconUserCheck } from "@tabler/icons-react";
import Image from "next/image";

export default function HowItWorks() {
  return (
    <main className="min-h-screen bg-[#FDF8F4] py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-6">
            How Box of Hope Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Making a difference in your community is easy with Box of Hope. Follow these simple steps to start donating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#E86C3A]/10 rounded-full flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#0A2540] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
              <div className="absolute top-8 right-8 text-4xl font-bold text-[#E86C3A]/10">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0A2540] text-white rounded-xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Ready to Start Donating?</h2>
              <p className="text-gray-300 mb-6">
                Join our community of donors and make a real impact in your local area. Create an account to start fulfilling wishes.
              </p>
              <button className="bg-[#E86C3A] hover:bg-[#D55C2A] text-white px-8 py-4 rounded-lg font-medium transition-colors">
                Let's Donate
              </button>
            </div>
            <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden">
              <Image
                src="/donating.gif"
                alt="Donation process animation"
                fill
                className="object-contain w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#E86C3A]/20 to-transparent mix-blend-overlay" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const steps = [
  {
    title: "Create Your Account",
    description: "Sign up as a donor to start browsing and fulfilling community wishes.",
    icon: <IconUserCheck className="w-6 h-6 text-[#E86C3A]" />,
  },
  {
    title: "Browse Wishes",
    description: "Explore needs in your community and find wishes that resonate with you.",
    icon: <IconHeart className="w-6 h-6 text-[#E86C3A]" />,
  },
  {
    title: "Choose Items to Donate",
    description: "Select the items you'd like to donate from the wish lists.",
    icon: <IconGift className="w-6 h-6 text-[#E86C3A]" />,
  },
  {
    title: "Deliver Hope",
    description: "Drop off your donations at the specified location or arrange pickup.",
    icon: <IconTruck className="w-6 h-6 text-[#E86C3A]" />,
  },
]; 