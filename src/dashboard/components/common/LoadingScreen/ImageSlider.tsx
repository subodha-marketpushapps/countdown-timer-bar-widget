import React, { useEffect, useState } from "react";
import { ImageSliderProps } from "./slider-types";
import { FEATURE_SLIDES } from "../../../../constants";
import "./ImageSlider.css";
import { Box, Text, IconButton, Image } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";

// Utility function to parse markdown-style bold text
const parseDescription = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, index) => {
    if (
      part.indexOf("**") === 0 &&
      part.lastIndexOf("**") === part.length - 2
    ) {
      const boldText = part.slice(2, -2);
      return (
        <Text key={index} weight="bold" light>
          {boldText}
        </Text>
      );
    }
    return (
      <Text key={index} light>
        {part}
      </Text>
    );
  });
};

export const ImageSlider: React.FC<ImageSliderProps> = ({
  slides = FEATURE_SLIDES,
  autoSlide = true,
  slideInterval = 4000,
}) => {
  // Randomize slides order on component mount
  const [randomizedSlides] = useState(() => {
    const shuffled = [...slides];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || randomizedSlides.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % randomizedSlides.length);
        setIsTransitioning(false);
      }, 300);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, randomizedSlides.length]);

  const goToSlide = (index: number) => {
    if (index === currentSlide || isTransitioning) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrevious = () => {
    if (isTransitioning) return;
    const prevIndex =
      currentSlide === 0 ? randomizedSlides.length - 1 : currentSlide - 1;
    goToSlide(prevIndex);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    const nextIndex = (currentSlide + 1) % randomizedSlides.length;
    goToSlide(nextIndex);
  };

  const currentSlideData = randomizedSlides[currentSlide];

  return (
    <Box
      width={"100%"}
      height={"100%"}
      position="relative"
      direction="vertical"
    >
      <Box
        verticalAlign="middle"
        align="space-between"
        position="relative"
        gap={4}
        width={"100%"}
        height={"calc(100dvh - 60px)"}
      >
        {/* Navigation Buttons */}
        <IconButton
          skin="light"
          priority="tertiary"
          onClick={goToPrevious}
          disabled={isTransitioning}
        >
          <Icons.ChevronLeftLarge />
        </IconButton>

        {/* Main Slide Container */}
        <Box
          height={"100%"}
          width="100%"
          position="relative"
          maxWidth={"800px"}
          verticalAlign="middle"
        >
          <Box
            className={`custom-slide-content ${
              isTransitioning ? "transitioning" : ""
            }`}
            gap={4}
            direction="vertical"
          >
            {/* Image Container */}
            <Box width={"100%"} position="relative" overflow="hidden">
              {currentSlideData?.imagePath ? (
                <Image
                  src={currentSlideData.imagePath}
                  alt={currentSlideData.imageAlt}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  width="100%"
                  height="auto"
                  transparent={true}
                />
              ) : null}
            </Box>

            {/* Content */}
            <Box gap={2} direction="vertical">
              <Text light>
                {currentSlideData?.description &&
                  parseDescription(currentSlideData.description)}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Navigation Buttons */}
        <IconButton
          skin="light"
          priority="tertiary"
          onClick={goToNext}
          disabled={isTransitioning}
        >
          <Icons.ChevronRightLarge />
        </IconButton>
      </Box>

      {/* Pagination Dots */}
      <div className="custom-pagination">
        {randomizedSlides.map((_, index) => (
          <button
            key={index}
            className={`custom-pagination-dot ${
              index === currentSlide ? "active" : ""
            }`}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </Box>
  );
};
