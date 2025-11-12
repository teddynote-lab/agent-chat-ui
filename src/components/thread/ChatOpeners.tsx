import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatOpenersProps {
  chatOpeners: string[];
  onSelectOpener: (opener: string) => void;
  disabled: boolean;
}

export function ChatOpeners({ chatOpeners, onSelectOpener, disabled }: ChatOpenersProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(chatOpeners.length / itemsPerPage);
  const shouldShowCarousel = chatOpeners.length > itemsPerPage;

  const currentItems = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return chatOpeners.slice(startIndex, endIndex);
  }, [currentPage, chatOpeners, itemsPerPage]);

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const openerButtonHandler = (opener: string) => () => {
    if (disabled) {
      return;
    }
    onSelectOpener(opener);
  };

  return (
    <div className="flex flex-col gap-3 w-[calc(100%_-_12rem)]">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {currentItems.map((opener, index) => (
              <button
                key={`${currentPage}-${index}`}
                onClick={openerButtonHandler(opener)}
                disabled={disabled}
                className={cn(
                  "group relative overflow-hidden rounded-xl border border-border bg-card hover:bg-accent hover:border-primary transition-all duration-200 p-4 text-left shadow-sm hover:shadow-md min-h-[5rem] flex items-center cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed hover:bg-card hover:border-border"
                )}
              >
                <p className="text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors break-keep">
                  {opener}
                </p>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {shouldShowCarousel && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={goToPrevPage}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentPage
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNextPage}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
