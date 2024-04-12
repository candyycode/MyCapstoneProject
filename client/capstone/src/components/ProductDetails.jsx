import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { productId } = useParams(); // Get the productId from URL params
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch individual product details from API using productId
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`); 
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    fetchProductDetails();

    // Cleanup function to cancel the fetch request (optional)
    return () => {
      // Cleanup logic
    };
  }, [productId]);

  return (
    <div>
      {product ? (
        <div>
          <h2>{product.name}</h2>
          <p>Price: ${product.price}</p>
          <p>Description: {product.description}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProductDetails;