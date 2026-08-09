import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ProductCard from './ProductCard';
import axios from '../utils/axios';

const RelatedProducts = ({ currentProductId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentProductId && category) {
      fetchRelatedProducts();
    }
  }, [currentProductId, category]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/products', {
        params: {
          category,
          limit: 8,
          exclude: currentProductId
        }
      });
      
      if (response.data.success) {
        const prods = (response.data?.data?.products || []).map(p => ({
          ...p,
          id: p.id || p._id,
        }));
        setRelatedProducts(prods);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
      setError(error.response?.data?.message || 'Failed to load related products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !relatedProducts.length) {
    return null;
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Related Products in {category}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            viewMode="grid"
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
