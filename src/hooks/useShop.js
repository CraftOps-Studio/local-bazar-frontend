import { useState, useEffect } from 'react';

// Placeholder for useShop hook
export const useShop = (shopId) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shopId) return;

    const fetchShop = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        // const response = await api.get(`/shops/${shopId}`);
        // setShop(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching shop');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [shopId]);

  return { shop, loading, error };
};
