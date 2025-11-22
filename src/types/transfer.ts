export interface Transfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: "DRAFT" | "IN_TRANSIT" | "COMPLETED" | "CANCELED";
  notes: string | null;
  userId: string;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fromWarehouse: {
    id: string;
    name: string;
    location: string | null;
  };
  toWarehouse: {
    id: string;
    name: string;
    location: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: TransferItem[];
}

export interface TransferItem {
  id: string;
  transferId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    unitOfMeasure: string;
    warehouseId: string;
  };
}

export interface TransferListItem {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: "DRAFT" | "IN_TRANSIT" | "COMPLETED" | "CANCELED";
  createdAt: Date;
  fromWarehouse: {
    id: string;
    name: string;
  };
  toWarehouse: {
    id: string;
    name: string;
  };
  user: {
    name: string | null;
  };
  itemsCount: number;
  totalQuantity: number;
}

export interface TransferFilters {
  status?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  search?: string;
}
