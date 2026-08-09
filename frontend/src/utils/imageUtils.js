// Image utility functions for consistent image URL handling

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get the full URL for a product image
 * @param {string} imageName - The image filename
 * @returns {string} - Full image URL
 */
export const getProductImageUrl = (imageName) => {
  if (!imageName) return getDefaultProductImageUrl();
  // Encode the filename to handle spaces and special characters
  const encodedImageName = encodeURIComponent(imageName);
  return `${API_BASE_URL}/files/products/${encodedImageName}`;
};

/**
 * Get the full URL for the default product image
 * @returns {string} - Default product image URL
 */
export const getDefaultProductImageUrl = () => {
  return `${API_BASE_URL}/files/default-product.jpg`;
};

/**
 * Get the full URL for an avatar image
 * @param {string} avatarName - The avatar filename
 * @returns {string} - Full avatar URL
 */
export const getAvatarUrl = (avatarName) => {
  if (!avatarName) return `${API_BASE_URL}/files/avatars/avatar1.png`;
  return `${API_BASE_URL}/files/avatars/${avatarName}`;
};

/**
 * Get the first product image URL or placeholder if no images
 * @param {string[]} images - Array of image filenames
 * @param {boolean} useDefaultForEmpty - Whether to use default image or placeholder for empty arrays
 * @returns {string} - Image URL
 */
export const getFirstProductImage = (images, useDefaultForEmpty = true) => {
  if (images && images.length > 0) {
    return getProductImageUrl(images[0]);
  }
  return useDefaultForEmpty ? getDefaultProductImageUrl() : '/api/placeholder/300/240';
};

/**
 * Get all product image URLs
 * @param {string[]} images - Array of image filenames  
 * @returns {string[]} - Array of full image URLs
 */
export const getProductImageUrls = (images) => {
  if (!images || images.length === 0) {
    return [getDefaultProductImageUrl()];
  }
  return images.map(image => getProductImageUrl(image));
};

/**
 * Handle image error by setting fallback image
 * @param {Event} event - Image error event
 */
export const handleImageError = (event) => {
  event.target.src = getDefaultProductImageUrl();
};
