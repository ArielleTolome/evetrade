import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

const Carousel = ({
  children,
  slidesToShow: slidesToShowProp = { mobile: 1, tablet: 2, desktop: 3 },
  autoPlay = false,
  interval = 5000,
  showDots = true,
  showArrows = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);

  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });
  const isTablet = useMediaQuery({ query: '(min-width: 768px)' });

  const getSlidesToShow = () => {
    if (isDesktop) return slidesToShowProp.desktop;
    if (isTablet) return slidesToShowProp.tablet;
    return slidesToShowProp.mobile;
  };

  const slidesToShow = getSlidesToShow();
  const totalSlides = React.Children.count(children);
  const totalPages = Math.ceil(totalSlides / slidesToShow);

  const goToPage = useCallback((pageIndex) => {
    const newIndex = pageIndex * slidesToShow;
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.scrollWidth / totalSlides;
      carouselRef.current.scrollTo({
        left: newIndex * slideWidth,
        behavior: 'smooth',
      });
      setCurrentIndex(newIndex);
    }
  }, [slidesToShow, totalSlides]);

  const handleScroll = () => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.scrollWidth / totalSlides;
      const newIndex = Math.round(carouselRef.current.scrollLeft / slideWidth);
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [totalSlides]);

  useEffect(() => {
    if (autoPlay && !isHovering) {
      const timer = setInterval(() => {
        const currentPage = Math.floor(currentIndex / slidesToShow);
        const nextPage = (currentPage + 1) % totalPages;
        goToPage(nextPage);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [currentIndex, autoPlay, interval, isHovering, slidesToShow, totalPages, goToPage]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentPage = Math.floor(currentIndex / slidesToShow);
        goToPage((currentPage - 1 + totalPages) % totalPages);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentPage = Math.floor(currentIndex / slidesToShow);
        goToPage((currentPage + 1) % totalPages);
      }
    },
    [currentIndex, slidesToShow, totalPages, goToPage]
  );

  const currentPage = Math.floor(currentIndex / slidesToShow);

  const peek = 1.05;

  return (
    <div
      className="relative w-full bg-carousel-background"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="region"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth px-12"
      >
        {React.Children.map(children, (child, index) => (
          <div
            className="flex-shrink-0 snap-center p-2"
            style={{
              width: `${(100 / slidesToShow) / peek}%`,
            }}
            key={index}
          >
            <div className="bg-carousel-card-background">{child}</div>
          </div>
        ))}
      </div>

      {showArrows && isTablet && (
        <>
          <button
            onClick={() => goToPage((currentPage - 1 + totalPages) % totalPages)}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full p-2 bg-carousel-arrow-background text-carousel-arrow-color"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => goToPage((currentPage + 1) % totalPages)}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-2 bg-carousel-arrow-background text-carousel-arrow-color"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showDots && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-3 h-3 rounded-full mx-1 ${
                i === currentPage ? 'bg-carousel-dot-active-color' : 'bg-carousel-dot-color'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Carousel.propTypes = {
  children: PropTypes.node.isRequired,
  slidesToShow: PropTypes.shape({
    mobile: PropTypes.number,
    tablet: PropTypes.number,
    desktop: PropTypes.number,
  }),
  autoPlay: PropTypes.bool,
  interval: PropTypes.number,
  showDots: PropTypes.bool,
  showArrows: PropTypes.bool,
};

export default Carousel;
