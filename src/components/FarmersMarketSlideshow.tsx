import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const FarmersMarketSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      background: "bg-gradient-to-br from-green-400 via-emerald-500 to-green-600",
      title: "Fresh from Farm to Table",
      subtitle: "Connect directly with local farmers and get the freshest produce delivered to your doorstep.",
      buttonText: "Start Shopping Fresh",
      buttonColor: "bg-white text-green-600 hover:bg-green-50",
      items: [
        {
          image: "🥕",
          name: "Fresh Carrots",
          category: "Vegetables"
        },
        {
          image: "🍎",
          name: "Organic Apples", 
          category: "Fruits"
        },
        {
          image: "🥬",
          name: "Leafy Greens",
          category: "Vegetables"
        }
      ]
    },
    {
      id: 2,
      background: "bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500",
      title: "Support Local Farmers",
      subtitle: "Every purchase helps sustain local agriculture and brings fresh, seasonal produce to your community.",
      buttonText: "Meet Our Farmers",
      buttonColor: "bg-white text-amber-700 hover:bg-amber-50",
      items: [
        {
          image: "🌽",
          name: "Sweet Corn",
          category: "Grains"
        },
        {
          image: "🍅",
          name: "Heirloom Tomatoes",
          category: "Vegetables"
        },
        {
          image: "🥒",
          name: "Garden Cucumbers",
          category: "Vegetables"
        }
      ]
    },
    {
      id: 3,
      background: "bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-500",
      title: "Organic & Sustainable",
      subtitle: "Discover pesticide-free, sustainably grown produce that's good for you and the environment.",
      buttonText: "Shop Organic",
      buttonColor: "bg-white text-purple-600 hover:bg-purple-50",
      items: [
        {
          image: "🥦",
          name: "Organic Broccoli",
          category: "Vegetables"
        },
        {
          image: "🫐",
          name: "Wild Blueberries",
          category: "Berries"
        },
        {
          image: "🌶️",
          name: "Hot Peppers",
          category: "Spices"
        }
      ]
    },
    {
      id: 4,
      background: "bg-gradient-to-br from-red-400 via-pink-500 to-rose-500",
      title: "Seasonal Harvest",
      subtitle: "Enjoy the best flavors of each season with our rotating selection of peak-freshness produce.",
      buttonText: "Explore Seasonal",
      buttonColor: "bg-white text-red-600 hover:bg-red-50",
      items: [
        {
          image: "🍓",
          name: "Strawberries",
          category: "Berries"
        },
        {
          image: "🥕",
          name: "Baby Carrots",
          category: "Vegetables"
        },
        {
          image: "🌿",
          name: "Fresh Herbs",
          category: "Herbs"
        }
      ]
    }
  ];

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full h-96 overflow-hidden">
      {/* Main Slide Content */}
      <div className={`w-full h-full transition-all duration-1000 ${currentSlideData.background}`}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Left Content */}
          <div className="flex-1 text-white max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {currentSlideData.title}
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed">
              {currentSlideData.subtitle}
            </p>
            <button className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${currentSlideData.buttonColor}`}>
              {currentSlideData.buttonText}
            </button>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="flex-1 flex justify-end items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentSlideData.items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center transform transition-all duration-500 hover:scale-110 hover:bg-white/30"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-6xl mb-4 animate-bounce" style={{ animationDelay: `${index * 300}ms` }}>
                    {item.image}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {item.name}
                  </h3>
                  <p className="text-white/80 text-sm uppercase tracking-wide">
                    {item.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        {/* Slide Indicators */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={toggleAutoPlay}
          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
        >
          {isAutoPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-white/20 text-8xl animate-pulse">
        🌱
      </div>
      <div className="absolute bottom-10 right-10 text-white/20 text-6xl animate-bounce">
        🚚
      </div>
    </div>
  );
};

export default FarmersMarketSlideshow;