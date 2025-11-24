export type ReceiptStatus = "DRAFT" | "READY" | "DONE" | "CANCELED";
export type DeliveryStatus = "DRAFT" | "READY" | "DONE" | "CANCELED";

export interface DashboardKPIs {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  internalTransfers: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface DashboardFilters {
  warehouses: Warehouse[];
  categories: Category[];
  receiptStatuses: ReceiptStatus[];
  deliveryStatuses: DeliveryStatus[];
}

export interface FilterState {
  warehouseId: string;
  categoryId: string;
  receiptStatus: ReceiptStatus | "" | "all";
  deliveryStatus: DeliveryStatus | "" | "all";
}
