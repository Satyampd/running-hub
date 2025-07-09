// src/components/ImageGalleryModal.tsx
import React, { useState, useEffect } from 'react';
import ModalPortal from './ModalPortal'; // Make sure this path is correct relative to ImageGalleryModal

interface ImageGalleryModalProps {
  images: string[];
  altPrefix?: string; // Optional prefix for alt text, e.g., "Event image"
}

export default function ImageGalleryModal({ images, altPrefix = "Gallery image" }: ImageGalleryModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Helper function to show next image
  const showNextImage = () => {
    if (selectedIndex !== null && images && selectedIndex < images.length - 1) {
      const nextIndex = selectedIndex + 1;
      setSelectedIndex(nextIndex);
      setSelectedImage(images[nextIndex]);
    }
  };

  // Helper function to show previous image
  const showPreviousImage = () => {
    if (selectedIndex !== null && images && selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setSelectedImage(images[prevIndex]);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX !== null && selectedIndex !== null && images) {
      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartX - touchEndX;
      const threshold = 50; // Pixels for swipe detection

      if (distance > threshold) {
        showNextImage();
      } else if (distance < -threshold) {
        showPreviousImage();
      }
      setTouchStartX(null); // Reset touch start after swipe
    }
  };

  // Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === 'Escape') {
          setSelectedImage(null);
          setSelectedIndex(null);
        } else if (e.key === 'ArrowRight') {
          showNextImage();
        } else if (e.key === 'ArrowLeft') {
          showPreviousImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, selectedIndex, images]); // Depend on images prop to update for next/prev

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden'; // Also prevent scrolling on html element
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset'; // Reset html overflow
    }
    return () => {
      document.body.style.overflow = 'unset'; // Clean up on unmount
      document.documentElement.style.overflow = 'unset';
    };
  }, [selectedImage]);

  // Don't render anything if no images are provided
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery of images */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((photo, idx) => (
          <img
            key={idx}
            src={photo}
            alt={`${altPrefix} ${idx + 1}`}
            className="w-full h-64 object-contain rounded-xl shadow cursor-pointer" // object-contain for gallery view
            onClick={() => {
              setSelectedImage(photo);
              setSelectedIndex(idx);
            }}
          />
        ))}
      </div>

      {/* Full-screen Image Modal */}
      {selectedImage && (
        <ModalPortal> {/* This is where the portal is used */}
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setSelectedImage(null);
              setSelectedIndex(null);
            }}
          >
            <div
              className="relative flex flex-col items-center justify-center w-full h-full"
              onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking image itself
            >
              {/* Previous Button (Desktop) */}
              {selectedIndex !== null && selectedIndex > 0 && (
                <button
                  onClick={showPreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full z-10 hidden md:block"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
              )}

              <img
                src={selectedImage}
                alt="Enlarged"
                className="max-w-full max-h-full object-contain rounded-lg p-4"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />

              {/* Next Button (Desktop) */}
              {selectedIndex !== null && images && selectedIndex < images.length - 1 && (
                <button
                  onClick={showNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full z-10 hidden md:block"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              )}

              {/* Cross Button (always visible) */}
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setSelectedIndex(null);
                }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/75 text-white text-3xl font-bold p-2 rounded-full leading-none w-10 h-10 flex items-center justify-center z-20"
                aria-label="Close image"
              >
                &times;
              </button>
            </div>
            {/* Mobile Navigation Arrows (visible on smaller screens) */}
            {images && images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 md:hidden">
                  {selectedIndex !== null && selectedIndex > 0 && (
                      <button
                          onClick={showPreviousImage}
                          className="bg-black/50 hover:bg-black/75 text-white p-3 rounded-full"
                          aria-label="Previous image"
                      >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"></path>
                          </svg>
                      </button>
                  )}
                  {selectedIndex !== null && selectedIndex < images.length - 1 && (
                      <button
                          onClick={showNextImage}
                          className="bg-black/50 hover:bg-black/75 text-white p-3 rounded-full"
                          aria-label="Next image"
                      >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                          </svg>
                      </button>
                  )}
              </div>
            )}
          </div>
        </ModalPortal>
      )}
    </>
  );
}