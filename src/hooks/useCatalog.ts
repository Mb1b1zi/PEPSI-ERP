import { useEffect, useState } from 'react';
import type { Product, Quantity, Depot } from '@/types/catalog';
import { catalogService } from '@/services/catalogService';

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Quantity[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [productsData, quantitiesData, depotsData] = await Promise.all([
          catalogService.getProducts(),
          catalogService.getQuantities(),
          catalogService.getDepots(),
        ]);
        setProducts(productsData);
        setQuantities(quantitiesData);
        setDepots(depotsData);
      } catch {
        setError('Failed to load catalog data.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return { products, quantities, depots, isLoading, error };
}
