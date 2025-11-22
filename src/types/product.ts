export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  categoryId: string;
  unitOfMeasure: string;
  stock: number;
  minStockLevel: number | null;
  warehouseId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  category: {
    id: string;
    name: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
}

export interface ProductListItem extends Product {
  stockStatus: "out" | "low" | "ok";
}

export interface ProductFilters {
  search: string;
  categoryId: string;
}
