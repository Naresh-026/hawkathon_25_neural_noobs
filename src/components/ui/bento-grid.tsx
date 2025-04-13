import { cn } from "@/lib/cn";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  image,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  image?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 relative",
        className
      )}
    >
      {image}
      <div className="relative z-10 flex flex-col h-full">
        {header}
        <div className="group-hover/bento:translate-x-2 transition duration-200 mt-auto">
          {icon}
          <div className="font-sans font-bold text-white text-xl md:text-2xl mb-2 mt-2">
            {title}
          </div>
          <div className="font-sans font-normal text-white/90 text-base md:text-lg">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}; 