"use client";

import { motion } from "framer-motion";

const stats = [
  {
    id: 1,
    number: "6,163",
    label: "Wishes fulfilled",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#E86C3A]"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 2,
    number: "92.36%",
    label: "Success rate",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#E86C3A]"
      >
        <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12V0" />
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
        <path d="M18 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    ),
  },
  {
    id: 3,
    number: "168,321",
    label: "Community members",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#E86C3A]"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
];

export function StatsSection() {
  return (
    <section className="py-10 bg-[#0A2540] relative">
      <div className="max-w-7xl mx-auto px-8">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-white text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Our Impact in Numbers
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: stat.id * 0.2 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="mb-3 p-2 rounded-full bg-white/5">
                <div className="w-[18px] h-[18px]">
                  {stat.icon}
                </div>
              </div>
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-white mb-1"
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  delay: stat.id * 0.2 + 0.3 
                }}
              >
                {stat.number}
              </motion.h3>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
    </section>
  );
} 