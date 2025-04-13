import { HoverCard } from "@/components/ui/hover-card";

const steps = [
  {
    id: 1,
    title: "Browse Wishes",
    description: "Explore community needs and find wishes you can fulfill.",
    icon: "🔍",
  },
  {
    id: 2,
    title: "Choose to Help",
    description: "Select a wish and commit to providing the needed items.",
    icon: "❤️",
  },
  {
    id: 3,
    title: "Deliver Hope",
    description: "Drop off your donations at the specified location.",
    icon: "📦",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-8 bg-[#0A2540] text-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center">How It Works</h2>
        <p className="text-xl text-center mb-12 text-gray-300">
          Making a difference in your community is easy with Box of Hope
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <HoverCard 
              key={step.id}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 