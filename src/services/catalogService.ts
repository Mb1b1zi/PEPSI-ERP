/**
 * Thin aggregator over the three Admin catalog services (Products, Quantities, Depots), each
 * real-API backed in its own file (productService.ts, quantityService.ts,
 * depotLocationService.ts). Exists so callers needing all three together (e.g. useCatalog) have
 * one import, while each resource's own Admin CRUD screen still owns its canonical store — an
 * edit made through the Admin UI is reflected here too, not duplicated into a second copy.
 */
import { productService } from '@/services/productService';
import { quantityService } from '@/services/quantityService';
import { depotLocationService } from '@/services/depotLocationService';

export const catalogService = {
  getProducts: productService.getProducts,
  getQuantities: quantityService.getQuantities,
  getDepots: depotLocationService.getDepots,
};
