import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { productAPI } from '../utils/axios';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getReviews(productId);
      setReviews(res.data?.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (!newReview.comment.trim()) {
      alert('Please enter a review comment');
      return;
    }

    try {
      setSubmitting(true);
      await productAPI.upsertReview(productId, newReview.rating, newReview.comment);
      await fetchReviews();
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            } transition-transform`}
            disabled={!interactive}
          >
            <svg
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h4>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-gray-900">
                {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div>
                {renderStars(Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length))}
                <p className="text-sm text-gray-600 mt-1">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Write a Review */}
      {user && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h5 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h5>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                id="review-comment"
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                submitting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h5 className="text-lg font-medium text-gray-900">All Reviews</h5>
          {reviews.map((review) => (
            <div key={review._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-gray-900">
                    {review.user.firstName} {review.user.lastName}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Login Prompt for Non-authenticated Users */}
      {!user && (
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">Please login to write a review</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Login to Review
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
