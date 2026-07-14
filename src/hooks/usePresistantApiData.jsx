import { useEffect, useState } from 'react';

const usePersistentApiData = (key, fetchApi) => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : null;
  });

  const [loading, setLoading] = useState(!data); // Only show loading if no data is persisted
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchApi();
        setData(response);
        localStorage.setItem(key, JSON.stringify(response));
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchApi, key]);

  const clearData = () => {
    setData(null);
    localStorage.removeItem(key);
  };

  return { data, loading, error, clearData };
};

export default usePersistentApiData;
