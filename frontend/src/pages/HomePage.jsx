import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  selectFeaturedProducts, 
  selectCategories,
  selectProductsLoading,
  fetchFeaturedProducts,
  fetchCategories 
} from '../store/productSlice';
import { getFirstProductImage } from '../utils/imageUtils';
import formatINR from '../utils/currency';

const HomePage = () => {
  const dispatch = useDispatch();
  const featuredProducts = useSelector(selectFeaturedProducts);
  const categories = useSelector(selectCategories);
  const loading = useSelector(selectProductsLoading);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Local mapping for category images from /public
  const categoryImages = {
    jewelry: '/jewlery1.jpg',
    crafts: '/craft1.jpg',
    clothing: '/clothing1.jpg',
    textiles: '/textile1.jpg',
  };

  // Hero carousel slides
  const heroSlides = [
    {
      key: 'discover-art',
  image: "/Craftes-categories.jpg",
      title: "Discover Authentic Tribal Art",
      subtitle: "Handcrafted treasures from indigenous communities worldwide",
      cta: "Shop Now",
      link: "/products"
    },
    {
      key: 'jewelry-collection',
  image: "/Jwelery-categories.jpg",
      title: "Traditional Jewelry Collection",
      subtitle: "Exquisite pieces reflecting centuries of craftsmanship",
      cta: "Explore Jewelry",
      link: "/categories/jewelry"
    },
    {
      key: 'handwoven-textiles',
  image: "/jwelery1-categorie.jpg",
      title: "Handwoven Textiles",
      subtitle: "Beautiful fabrics created with time-honored techniques",
      cta: "View Textiles",
      link: "/categories/textiles"
    }
  ];

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Auto-play carousel with pause on hover
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [heroSlides.length, isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  return (
    <div className="min-h-screen font-gilroy">
      {/* Hero Section with Carousel */}
      <section 
        className="relative h-96 md:h-[500px] overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full h-full">
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
      {heroSlides.map((slide, index) => (
              <div
        key={slide.key}
                className="w-full h-full flex-shrink-0 relative"
              >
                <div 
                  className="w-full h-full bg-cover bg-center bg-gray-300"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl px-4">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        {slide.title}
                      </h1>
                      <p className="text-lg md:text-xl mb-8 opacity-90 font-light">
                        {slide.subtitle}
                      </p>
                      <Link
                        to={slide.link}
                        className="inline-block text-white font-medium px-8 py-3 rounded-lg transition-colors duration-300 bg-[#ebb665] hover:bg-[#d2a45b]"
                      >
                        {slide.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200 z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
      {heroSlides.map((slide, index) => (
            <button
        key={`indicator-${slide.key}`}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Trybee?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              We connect you directly with artisans, ensuring authenticity and fair trade practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-[#ebb665] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#ebb665]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Authentic Products</h3>
              <p className="text-gray-600 font-light">
                Every item is genuine, handcrafted by skilled artisans using traditional methods
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-[#ebb665] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#ebb665]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Fair Trade</h3>
              <p className="text-gray-600 font-light">
                We ensure fair compensation for artisans and sustainable practices
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-[#ebb665] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#ebb665]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Global Delivery</h3>
              <p className="text-gray-600 font-light">
                Secure packaging and worldwide shipping to bring art to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Explore our diverse collection of tribal art and crafts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`cat-skel-${index}`} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="w-full h-32 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              categories.slice(0, 4).map((category) => {
                const catKey = (category.slug || category.name || '').toLowerCase();
                const catImg = category.image || categoryImages[catKey] || "/api/placeholder/300/200";
                return (
                <Link
                  key={category._id}
                  to={`/categories/${category.slug}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                >
                  <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                    <img
                      src={catImg}
                      alt={category.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {category.name}
                    </h3>
        <p className="text-gray-600 text-sm font-light">
                      {category.description || `Discover authentic ${category.name.toLowerCase()}`}
                    </p>
                  </div>
                </Link>
                );
              })
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/categories"
      className="inline-block text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300 bg-[#ebb665] hover:bg-[#d2a45b]"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Handpicked items from our finest artisans
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={`prod-skel-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2 w-2/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : (
        featuredProducts.slice(0, 4).map((product) => (
                <Link
          key={product._id || product.id}
          to={`/products/${product._id || product.id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                >
                  <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                    <img
                      src={getFirstProductImage(product.images, false)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2 font-light">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatINR(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatINR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/products"
              className="inline-block text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300 bg-[#ebb665] hover:bg-[#d2a45b]"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

    {/* Newsletter Section */}
  <section className="py-16" style={{ background: 'linear-gradient(90deg, #ebb665 15%, #d2a45b 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Connected
          </h2>
      <p className="text-lg text-white mb-8 max-w-2xl mx-auto font-light">
            Subscribe to our newsletter for exclusive offers, new arrivals, and artisan stories
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex items-stretch">
              {/* Gradient border wrapper for the email input to match the subscribe button gradient */}
              <div
                className="flex-1 mr-[-1.5px] p-[1.5px] rounded-l-lg"
                style={{ background: 'linear-gradient(90deg, #0b6a4f 24%, #10b971 110%)' }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-full px-4 py-3 rounded-l-[0.5rem] bg-white focus:outline-none"
                />
              </div>
              <button
                className="text-white px-6 py-3 rounded-r-lg transition-colors duration-300 font-medium"
                style={{ background: 'linear-gradient(90deg, #0b6a4f 24%, #10b971 110%)' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
