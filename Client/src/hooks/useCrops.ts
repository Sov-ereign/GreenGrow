import { useState, useEffect } from 'react';
import { cropService, Crop } from '../services/cropService';
import { useAuth } from '../contexts/AuthContext';

export const useCrops = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrops = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await cropService.getCrops(user.id);
      setCrops(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [user]);

  return { crops, loading, error, refetch: fetchCrops };
};
