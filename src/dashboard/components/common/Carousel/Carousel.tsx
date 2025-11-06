import React, { useState, useEffect, ReactNode } from "react";
import { Box, IconButton, Text } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import "./Carousel.css";

export interface CarouselItem {
  id: string;
  content: ReactNode;
  label?: string;
}

export interface CarouselProps {
  items: CarouselItem[];
  autoSlide?: boolean;
  slideInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  navigationPosition?: "bottom" | "center";
  className?: string;
  onSlideChange?: (index: number) => void;
  initialIndex?: number;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  autoSlide = false,
  slideInterval = 3000,
  showNavigation = true,
  showDots = true,
  navigationPosition = "bottom",
  className = "",
  onSlideChange,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update current index when initialIndex changes
  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < items.length) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, items.length]);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || items.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        const nextIndex = (currentIndex + 1) % items.length;
        setCurrentIndex(nextIndex);
        setIsTransitioning(false);
        onSlideChange?.(nextIndex);
      }, 300);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, items.length, currentIndex, onSlideChange]);

  const goToSlide = (index: number) => {
    if (index === currentIndex || isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
      onSlideChange?.(index);
    }, 300);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    const nextIndex = (currentIndex + 1) % items.length;
    goToSlide(nextIndex);
  };

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  const renderLeftButton = () => {
    if (!showNavigation || items.length <= 1) return null;

    if (navigationPosition === "center") {
      return (
        <IconButton
          skin="light"
          priority="tertiary"
          onClick={goToPrevious}
          disabled={isTransitioning}
          style={{
            position: "absolute",
            left: "0",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        >
          <Icons.ChevronLeftLarge />
        </IconButton>
      );
    }

    return (
      <IconButton
        skin="primary"
        priority="tertiary"
        onClick={goToPrevious}
        disabled={isTransitioning}
        size="tiny"
        style={{ zIndex: 10 }}
      >
        <Icons.ChevronLeftLarge color="primary" />
      </IconButton>
    );
  };

  const renderRightButton = () => {
    if (!showNavigation || items.length <= 1) return null;

    if (navigationPosition === "center") {
      return (
        <IconButton
          skin="light"
          priority="tertiary"
          onClick={goToNext}
          disabled={isTransitioning}
          style={{
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
        >
          <Icons.ChevronRightLarge />
        </IconButton>
      );
    }

    return (
      <IconButton
        skin="primary"
        priority="tertiary"
        onClick={goToNext}
        disabled={isTransitioning}
        size="tiny"
        style={{ zIndex: 10 }}
      >
        <Icons.ChevronRightLarge />
      </IconButton>
    );
  };

  return (
    <Box
      width="100%"
      position="relative"
      direction="vertical"
      align="center"
      gap={2}
      className={`carousel-container ${className}`}
    >
      {/* Content Container */}
      <Box
        width="100%"
        position="relative"
        align="center"
        style={{ minHeight: "120px", padding: navigationPosition === "center" ? "0 40px" : "0" }}
      >
        {navigationPosition === "center" && (
          <>
            {renderLeftButton()}
            {renderRightButton()}
          </>
        )}

        {/* Content Display */}
        <Box
          className={`carousel-content ${isTransitioning ? "transitioning" : ""}`}
          width="100%"
          align="center"
        >
          <Box direction="vertical" align="center" gap={1}>
            {currentItem.label && (
            //   <div className="carousel-label">{currentItem.label}</div>
            <Text size="small" secondary>{currentItem.label}</Text>
            )}
            {currentItem.content}
          </Box>
        </Box>
      </Box>

      {/* Pagination Dots with Navigation (dots between buttons) */}
      {showDots && items.length > 1 && navigationPosition !== "center" && (
        <div className="carousel-pagination">
          {renderLeftButton()}
          <div className="carousel-dots">
            {items.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          {renderRightButton()}
        </div>
      )}

      {/* Dots only (when navigation is center) */}
      {showDots && items.length > 1 && navigationPosition === "center" && (
        <div className="carousel-pagination">
          {items.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </Box>
  );
};

export default Carousel;

