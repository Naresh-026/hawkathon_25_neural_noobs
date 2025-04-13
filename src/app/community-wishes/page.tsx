import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { IconHeart, IconGift, IconUsers } from "@tabler/icons-react";
import Image from "next/image";

export default function CommunityWishes() {
  return (
    <main className="min-h-screen bg-[#FDF8F4] py-16">
      <div className="max-w-7xl mx-auto px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-[#0A2540] mb-6">Community Wishes</h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl">
          Discover the various needs in your community and find meaningful ways to contribute.
        </p>

        <BentoGrid className="mb-12">
          <BentoGridItem
            title="School Supplies Drive"
            description="Help students succeed by providing essential school supplies."
            className="md:col-span-2 relative overflow-hidden"
            icon={<IconGift className="w-6 h-6 text-white" />}
            header={
              <div className="flex justify-between items-start z-10">
                <span className="bg-[#E86C3A]/80 text-white text-sm px-3 py-1 rounded-full">
                  High Priority
                </span>
                <span className="text-white text-base">15 items needed</span>
              </div>
            }
            image={
              <div className="absolute inset-0 z-0">
                <Image
                  src="/school.jpeg"
                  alt="School supplies"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
              </div>
            }
          />
          <BentoGridItem
            title="Local Food Bank"
            description="Support families by donating non-perishable food items."
            className="relative overflow-hidden"
            icon={<IconHeart className="w-6 h-6 text-white" />}
            header={
              <div className="flex justify-between items-start z-10">
                <span className="bg-[#E86C3A]/80 text-white text-sm px-3 py-1 rounded-full">
                  Ongoing
                </span>
              </div>
            }
            image={
              <div className="absolute inset-0 z-0">
                <Image
                  src="/foodbank.jpeg"
                  alt="Food bank"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
              </div>
            }
          />
          <BentoGridItem
            title="Community Center"
            description="Downtown community center seeking educational materials."
            className="relative overflow-hidden"
            icon={<IconUsers className="w-6 h-6 text-white" />}
            image={
              <div className="absolute inset-0 z-0">
                <Image
                  src="/community.jpeg"
                  alt="Community center"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
              </div>
            }
          />
          <BentoGridItem
            title="Winter Clothing"
            description="Help keep families warm this winter with clothing donations."
            className="md:col-span-2 relative overflow-hidden"
            icon={<IconGift className="w-6 h-6 text-white" />}
            image={
              <div className="absolute inset-0 z-0">
                <Image
                  src="/winter.jpeg"
                  alt="Winter clothing"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
              </div>
            }
          />
        </BentoGrid>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-xl shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-[#0A2540] mb-4">Ready to Make a Difference?</h2>
            <p className="text-gray-600 mb-6">
              Your donations can help create positive change in your community. Start by browsing wishes or creating an account to manage your donations.
            </p>
            <button className="bg-[#E86C3A] hover:bg-[#D55C2A] text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Browse All Wishes
            </button>
          </div>
          <div className="relative h-64">
            <Image
              src="/donating.gif"
              alt="Donating illustration"
              fill
              className="object-contain rounded-xl"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
} 