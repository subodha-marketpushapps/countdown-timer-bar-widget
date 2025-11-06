export interface FeatureSlide {
  id: number;
  title?: string;
  description: string;
  imagePath: string;
  imageAlt: string;
}

export interface ImageSliderProps {
  slides: FeatureSlide[];
  autoSlide?: boolean;
  slideInterval?: number;
}
