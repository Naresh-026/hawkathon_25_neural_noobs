import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

const wishes = [
  {
    title: "School Supplies for Kids",
    description: "Help provide backpacks and school supplies for 30 children in need.",
    category: "Education",
    location: "Downtown Community Center",
  },
  {
    title: "Winter Clothing Drive",
    description: "Collecting warm coats, gloves, and scarves for homeless shelter residents.",
    category: "Clothing",
    location: "Hope Shelter",
  },
  {
    title: "Senior Care Packages",
    description: "Essential items and comfort goods for elderly residents in assisted living.",
    category: "Senior Care",
    location: "Golden Years Home",
  },
  {
    title: "Food Bank Supplies",
    description: "Non-perishable food items needed for local food bank distribution.",
    category: "Food & Nutrition",
    location: "Community Food Bank",
  },
  {
    title: "Baby Essentials",
    description: "Diapers, formula, and baby care items for new mothers in need.",
    category: "Family Support",
    location: "Family Resource Center",
  },
  {
    title: "Pet Food Drive",
    description: "Help pet owners in need keep their furry friends well-fed.",
    category: "Pet Care",
    location: "Animal Welfare Center",
  },
  {
    title: "Medical Supplies",
    description: "Basic medical supplies and first aid kits for community health clinic.",
    category: "Healthcare",
    location: "Community Health Center",
  },
  {
    title: "Art Supplies",
    description: "Creative materials for after-school art programs and youth centers.",
    category: "Arts & Culture",
    location: "Youth Arts Center",
  },
  {
    title: "Sports Equipment",
    description: "Sports gear and equipment for underprivileged youth sports programs.",
    category: "Sports",
    location: "Community Sports Complex",
  },
  {
    title: "Books for Literacy",
    description: "Children's books and educational materials for literacy programs.",
    category: "Education",
    location: "Public Library",
  },
  {
    title: "Holiday Gift Drive",
    description: "Gifts and toys for children during the holiday season.",
    category: "Holiday",
    location: "Community Center",
  },
  {
    title: "Emergency Relief",
    description: "Essential supplies for families affected by recent natural disasters.",
    category: "Emergency",
    location: "Disaster Relief Center",
  }
];

export function WishList() {
  return (
    <section className="py-16 px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#0A2540] text-center mb-4">
          Top Community Wishes
        </h2>
        <p className="text-xl text-center mb-1 text-gray-600">
          Browse through current needs in your community
        </p>
        <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
          <InfiniteMovingCards
            items={wishes}
            direction="left"
            speed="normal"
            pauseOnHover={true}
          />
        </div>
      </div>
    </section>
  );
} 