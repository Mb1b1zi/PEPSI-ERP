export interface Product {
  id: number;
  name: string;
}

export interface Quantity {
  id: number;
  value: string;
}

export interface Depot {
  id: number;
  name: string;
}

export interface CreateProductInput {
  name: string;
}

export interface UpdateProductInput {
  name: string;
}

export interface CreateDepotInput {
  name: string;
}

export interface UpdateDepotInput {
  name: string;
}
