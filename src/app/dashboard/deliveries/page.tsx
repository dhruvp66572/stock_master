"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import { DeliveryFormDialog } from "@/components/deliveries/delivery-form-dialog";
import { ValidateDeliveryDialog } from "@/components/deliveries/validate-delivery-dialog";
import { CancelDeliveryDialog } from "@/components/deliveries/cancel-delivery-dialog";
import type { DeliveryListItem, Delivery } from "@/types/delivery";
import type { Warehouse } from "@/types/dashboard";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "READY", label: "Ready" },
  { value: "DONE", label: "Done" },
  { value: "CANCELED", label: "Canceled" },
];

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (warehouseFilter !== "all") params.append("warehouseId", warehouseFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const response = await fetch(`/api/deliveries?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch deliveries");

      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, warehouseFilter]);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/dashboard/filters");
      if (!response.ok) throw new Error("Failed to fetch warehouses");
      const data = await response.json();
      setWarehouses(data.warehouses);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchDeliveryDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/deliveries/${id}`);
      if (!response.ok) throw new Error("Failed to fetch delivery details");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching delivery details:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDeliveries();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchDeliveries]);

  const handleCreateSuccess = () => {
    fetchDeliveries();
  };

  const handleValidateClick = async (delivery: DeliveryListItem) => {
    const fullDelivery = await fetchDeliveryDetails(delivery.id);
    if (fullDelivery) {
      setSelectedDelivery(fullDelivery);
      setValidateDialogOpen(true);
    }
  };

  const handleCancelClick = async (delivery: DeliveryListItem) => {
    const fullDelivery = await fetchDeliveryDetails(delivery.id);
    if (fullDelivery) {
      setSelectedDelivery(fullDelivery);
      setCancelDialogOpen(true);
    }
  };

  const handleValidateSuccess = () => {
    fetchDeliveries();
    setSelectedDelivery(null);
  };

  const handleCancelSuccess = () => {
    fetchDeliveries();
    setSelectedDelivery(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      DRAFT: { variant: "secondary", className: "bg-slate-100 text-slate-700" },
      READY: { variant: "default", className: "bg-blue-100 text-blue-700" },
      DONE: { variant: "default", className: "bg-green-100 text-green-700" },
      CANCELED: { variant: "destructive", className: "bg-red-100 text-red-700" },
    };

    const config = variants[status] || variants.DRAFT;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
          <p className="text-muted-foreground">
            Manage and track all delivery orders
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Delivery
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by delivery number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Warehouse Filter */}
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-semibold text-muted-foreground">
                No deliveries found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all" || warehouseFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first delivery to get started"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Delivery Number</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total Qty</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">
                        {delivery.deliveryNumber}
                      </TableCell>
                      <TableCell>{delivery.customerName}</TableCell>
                      <TableCell>{delivery.warehouse.name}</TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell className="text-right">
                        {delivery.itemsCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {delivery.totalQuantity}
                      </TableCell>
                      <TableCell>{formatDate(delivery.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {delivery.status === "DRAFT" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleValidateClick(delivery)}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Validate
                            </Button>
                          )}
                          {(delivery.status === "DRAFT" ||
                            delivery.status === "READY") && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelClick(delivery)}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DeliveryFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        warehouses={warehouses}
        onSuccess={handleCreateSuccess}
      />

      <ValidateDeliveryDialog
        open={validateDialogOpen}
        onOpenChange={setValidateDialogOpen}
        delivery={selectedDelivery}
        onSuccess={handleValidateSuccess}
      />

      <CancelDeliveryDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        delivery={selectedDelivery}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}
