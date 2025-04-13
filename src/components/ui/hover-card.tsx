"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

export const HoverCard = ({
  children,
  className,
  icon,
  title,
  description,
}: {
  children?: React.ReactNode;
  className?: string;
  icon: string;
  title: string;
  description: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        "relative h-full w-full rounded-xl bg-white/5 border-0 overflow-hidden",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#E86C3A]/20 to-[#0A2540]/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10 p-6 text-center">
        <motion.div 
          className="text-4xl mb-4"
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0
          }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <motion.h3 
          className="text-xl font-semibold mb-2"
          animate={{ 
            y: isHovered ? -5 : 0,
            color: isHovered ? "#E86C3A" : "white"
          }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h3>
        <motion.p 
          className="text-gray-300"
          animate={{ 
            opacity: isHovered ? 1 : 0.8
          }}
          transition={{ duration: 0.3 }}
        >
          {description}
        </motion.p>
      </div>
    </motion.div>
  );
}; 