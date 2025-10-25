import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const usePresentationNavigation = (totalSlides: number) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, totalSlides - 1)));
  }, [totalSlides]);

  const goToFirstSlide = useCallback(() => {
    setCurrentSlide(0);
  }, []);

  const goToLastSlide = useCallback(() => {
    setCurrentSlide(totalSlides - 1);
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToFirstSlide();
          break;
        case 'End':
          e.preventDefault();
          goToLastSlide();
          break;
        case 'Escape':
          e.preventDefault();
          navigate('/');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToFirstSlide, goToLastSlide, navigate]);

  return {
    currentSlide,
    nextSlide,
    prevSlide,
    goToSlide,
    totalSlides,
  };
};
