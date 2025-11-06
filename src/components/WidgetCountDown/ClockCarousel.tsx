import React, { useState, useEffect } from "react";
import { Box, IconButton } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import Clock, { ClockProps } from "./Clock";
import "./ClockCarousel.css";

export interface ClockConfig extends ClockProps {
  id: string;
  label?: string;
}

interface ClockCarouselProps {
  clocks: ClockConfig[];
  autoSlide?: boolean;
  slideInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  navigationPosition?: "top" | "bottom" | "center";
}

const ClockCarousel: React.FC<ClockCarouselProps> = ({
  clocks,
  autoSlide = false,
  slideInterval = 3000,
  showNavigation = true,
  showDots = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || clocks.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % clocks.length);
        setIsTransitioning(false);
      }, 300);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, clocks.length]);

  const goToSlide = (index: number) => {
    if (index === currentIndex || isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    const prevIndex = currentIndex === 0 ? clocks.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    const nextIndex = (currentIndex + 1) % clocks.length;
    goToSlide(nextIndex);
  };

  if (clocks.length === 0) {
    return null;
  }

  const currentClock = clocks[currentIndex];

  return (
    <Box
      width="100%"
      position="relative"
      direction="vertical"
      align="center"
      gap={2}
    >
      {/* Clock Container */}
      <Box
        width="100%"
        position="relative"
        align="center"
        style={{ minHeight: "120px", padding: "0 40px" }}
      >


        {/* Clock Display */}
        <Box
          className={`clock-carousel-content ${isTransitioning ? "transitioning" : ""
            }`}
          width="100%"
          align="center"
          justify="center"
        >
          <Box direction="vertical" align="center" gap={1}>
            {currentClock.label && (
              <div className="clock-carousel-label">{currentClock.label}</div>
            )}
            <Clock {...currentClock} />
          </Box>
        </Box>
      </Box>

      {/* Pagination Dots */}
      {showDots && clocks.length > 1 && (
        <div>

          <div className="clock-carousel-pagination">
            <IconButton
              skin="primary" priority="tertiary"
              onClick={goToPrevious}
              disabled={isTransitioning}
              size="tiny"
              style={{
                zIndex: 10,
              }}
            >
              <Icons.ChevronLeftLarge color="primary" />
            </IconButton>
            {clocks.map((_, index) => (
              <button
                key={index}
                className={`clock-carousel-dot ${index === currentIndex ? "active" : ""
                  }`}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                aria-label={`Go to clock ${index + 1}`}
              />
            ))}
            <IconButton
              skin="primary" priority="tertiary"
              onClick={goToNext}
              disabled={isTransitioning}
              size="tiny"
              style={{
                zIndex: 10,
              }}
            >
              <Icons.ChevronRightLarge />
            </IconButton>
          </div>
        </div>
      )}
    </Box>
  );
};

export default ClockCarousel;

