import React, { useEffect, useState } from "react";

interface Slide {
  id: number;
  url: string;
  order: number;
}

interface HeroBackgroundSliderProps {
  slides: Slide[];
  interval?: number;
}

const HeroBackgroundSlider: React.FC<HeroBackgroundSliderProps> = ({ slides, interval = 5000 }) => {
  const [index, setIndex] = useState(0);

  // Construir URLs completas de las imágenes
  const getImageUrl = (url: string): string => {
    // Si ya es URL completa, usar tal cual
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Construir URL completa para imágenes del backend
    const API_BASE = import.meta.env.PUBLIC_API_URL || "http://localhost:4000";
    return url.startsWith("/") ? `${API_BASE}${url}` : `${API_BASE}/${url}`;
  };

  const imageUrls = slides.map((slide) => getImageUrl(slide.url));

  // Slider automático
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageUrls.length);
    }, interval);

    return () => clearInterval(id);
  }, [imageUrls, interval]);

  if (!imageUrls || imageUrls.length === 0) {
    return <div className="absolute inset-0 bg-gray-800" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {imageUrls.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
    </div>
  );
};

export default HeroBackgroundSlider;
