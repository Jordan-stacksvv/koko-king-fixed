import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryCarouselProps {
  categories: Array<{
    id: string;
    name: string;
    image: string;
  }>;
  onCategoryClick?: (categoryId: string) => void;
}

export const CategoryCarousel = ({ categories, onCategoryClick }: CategoryCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 py-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {[...categories, ...categories].map((category, idx) => (
          <div
            key={`${category.id}-${idx}`}
            className="flex-shrink-0 group/item cursor-pointer"
            onClick={() => onCategoryClick?.(category.id)}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-md group-hover/item:shadow-xl transition-all ring-4 ring-white">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform group-hover/item:scale-110"
                />
              </div>
              <h3 className="text-base font-semibold text-foreground text-center">
                {category.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};
