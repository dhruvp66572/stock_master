import type { DeliveryStatus } from "./dashboard";

export interface DeliveryItem {
  id: string;
  deliveryId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    unitOfMeasure: string;
  };
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  customerId: string | null;
  customerName: string;
  warehouseId: string;
  status: DeliveryStatus;
  notes: string | null;
  userId: string;
  deliveredAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  warehouse: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: DeliveryItem[];
}

export interface DeliveryListItem extends Delivery {
  itemsCount: number;
  totalQuantity: number;
}

export interface DeliveryFilters {
  status: DeliveryStatus | "all";
  warehouseId: string;
  search: string;
}
