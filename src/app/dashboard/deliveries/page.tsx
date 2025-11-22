// app/dashboard/deliveries/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Plus, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DeliveryFormDialog } from "@/components/deliveries/delivery-form-dialog";
import { DeliveryDetailsDialog } from "@/components/deliveries/delivery-details-dialog";

const statusColors = {
  DRAFT: "bg-gray-500",
  READY: "bg-yellow-500",
  DONE: "bg-green-500",
  CANCELED: "bg-red-500",
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  useEffect(() => {
    fetchDeliveries();
    fetchWarehouses();
  }, [statusFilter, searchTerm]);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/warehouses");
      const data = await response.json();
      if (data.success) setWarehouses(data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/deliveries?${params}`);
      const data = await response.json();
      if (data.success) setDeliveries(data.data);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch deliveries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this delivery?")) return;
    try {
      const response = await fetch(`/api/deliveries/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchDeliveries();
        toast.success("Delivery deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete delivery");
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchDeliveries();
    toast.success("Delivery created successfully");
  };

  const handleView = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery</h1>
          <p className="text-muted-foreground">
            Manage outgoing stock deliveries
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Delivery
        </Button>
      </div>

      <DeliveryFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        warehouses={warehouses}
      />

      {selectedDeliveryId && (
        <DeliveryDetailsDialog
          deliveryId={selectedDeliveryId}
          open={!!selectedDeliveryId}
          onOpenChange={(open) => !open && setSelectedDeliveryId(null)}
        />
      )}

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search by delivery number or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Delivery Address</TableHead>
                <TableHead>Operation Type</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-muted-foreground">No deliveries found</p>
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium">
                      {delivery.deliveryNumber}
                    </TableCell>
                    <TableCell>{delivery.deliveryAddress || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={delivery.operationType === "INCREMENT" ? "default" : "secondary"}>
                        {delivery.operationType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {delivery.scheduleDate
                        ? new Date(delivery.scheduleDate).toLocaleDateString()
                        : "Not scheduled"}
                    </TableCell>
                    <TableCell>{delivery.warehouse?.name}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[delivery.status as keyof typeof statusColors]}>
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(delivery.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(delivery.id)}
                          disabled={delivery.status === "DONE"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
