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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, CheckCircle, XCircle, Loader2, List, LayoutGrid, ArrowRight } from "lucide-react";
import { TransferFormDialog } from "@/components/transfers/transfer-form-dialog";
import { CompleteTransferDialog } from "@/components/transfers/complete-transfer-dialog";
import { CancelTransferDialog } from "@/components/transfers/cancel-transfer-dialog";
import type { TransferListItem, Transfer } from "@/types/transfer";
import type { Warehouse } from "@/types/dashboard";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELED", label: "Canceled" },
];

export default function MoveHistoryPage() {
  const [transfers, setTransfers] = useState<TransferListItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromWarehouseFilter, setFromWarehouseFilter] = useState("all");
  const [toWarehouseFilter, setToWarehouseFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (fromWarehouseFilter !== "all") params.append("fromWarehouseId", fromWarehouseFilter);
      if (toWarehouseFilter !== "all") params.append("toWarehouseId", toWarehouseFilter);
      if (searchTerm.trim()) params.append("search", searchTerm.trim());

      const response = await fetch(`/api/transfers?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch transfers");

      const data = await response.json();
      setTransfers(data);
    } catch (error) {
      console.error("Error fetching transfers:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, fromWarehouseFilter, toWarehouseFilter]);

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

  const fetchTransferDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/transfers/${id}`);
      if (!response.ok) throw new Error("Failed to fetch transfer details");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching transfer details:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTransfers();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchTransfers]);

  const handleCreateSuccess = () => {
    fetchTransfers();
  };

  const handleCompleteClick = async (transfer: TransferListItem) => {
    const fullTransfer = await fetchTransferDetails(transfer.id);
    if (fullTransfer) {
      setSelectedTransfer(fullTransfer);
      setCompleteDialogOpen(true);
    }
  };

  const handleCancelClick = async (transfer: TransferListItem) => {
    const fullTransfer = await fetchTransferDetails(transfer.id);
    if (fullTransfer) {
      setSelectedTransfer(fullTransfer);
      setCancelDialogOpen(true);
    }
  };

  const handleCompleteSuccess = () => {
    fetchTransfers();
    setSelectedTransfer(null);
  };

  const handleCancelSuccess = () => {
    fetchTransfers();
    setSelectedTransfer(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      DRAFT: { variant: "secondary", className: "bg-slate-100 text-slate-700" },
      IN_TRANSIT: { variant: "default", className: "bg-blue-100 text-blue-700" },
      COMPLETED: { variant: "default", className: "bg-green-100 text-green-700" },
      CANCELED: { variant: "destructive", className: "bg-red-100 text-red-700" },
    };

    const config = variants[status] || variants.DRAFT;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace("_", " ")}
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

  const getTransfersByStatus = (status: string) => {
    return transfers.filter((t) => t.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Move History</h1>
          <p className="text-muted-foreground">
            Track internal stock transfers between warehouses
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("kanban")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Kanban
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transfers..."
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

            {/* From Warehouse Filter */}
            <Select value={fromWarehouseFilter} onValueChange={setFromWarehouseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="From warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* To Warehouse Filter */}
            <Select value={toWarehouseFilter} onValueChange={setToWarehouseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="To warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Destinations</SelectItem>
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

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-semibold text-muted-foreground">
                  No transfers found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || statusFilter !== "all" || fromWarehouseFilter !== "all" || toWarehouseFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first transfer to get started"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer #</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total Qty</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">
                          {transfer.transferNumber}
                        </TableCell>
                        <TableCell>{transfer.fromWarehouse.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            {transfer.toWarehouse.name}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                        <TableCell className="text-right">
                          {transfer.itemsCount}
                        </TableCell>
                        <TableCell className="text-right">
                          {transfer.totalQuantity}
                        </TableCell>
                        <TableCell>{formatDate(transfer.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {(transfer.status === "DRAFT" || transfer.status === "IN_TRANSIT") && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleCompleteClick(transfer)}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Complete
                              </Button>
                            )}
                            {(transfer.status === "DRAFT" || transfer.status === "IN_TRANSIT") && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelClick(transfer)}
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
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["DRAFT", "IN_TRANSIT", "COMPLETED", "CANCELED"].map((status) => {
            const statusTransfers = getTransfersByStatus(status);
            const statusColors: Record<string, string> = {
              DRAFT: "bg-slate-50 border-slate-200",
              IN_TRANSIT: "bg-blue-50 border-blue-200",
              COMPLETED: "bg-green-50 border-green-200",
              CANCELED: "bg-red-50 border-red-200",
            };

            return (
              <Card key={status} className={statusColors[status]}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {status.replace("_", " ")}
                    </CardTitle>
                    <Badge variant="secondary" className="ml-auto">
                      {statusTransfers.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : statusTransfers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No transfers
                    </p>
                  ) : (
                    statusTransfers.map((transfer) => (
                      <Card key={transfer.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                              {transfer.transferNumber}
                            </span>
                            {getStatusBadge(transfer.status)}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <span className="font-medium">{transfer.fromWarehouse.name}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <ArrowRight className="h-3 w-3" />
                              <span>{transfer.toWarehouse.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{transfer.itemsCount} items</span>
                            <span>Qty: {transfer.totalQuantity}</span>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {formatDate(transfer.createdAt)}
                          </div>

                          {(status === "DRAFT" || status === "IN_TRANSIT") && (
                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8"
                                onClick={() => handleCompleteClick(transfer)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8 text-destructive hover:text-destructive"
                                onClick={() => handleCancelClick(transfer)}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <TransferFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        warehouses={warehouses}
        onSuccess={handleCreateSuccess}
      />

      <CompleteTransferDialog
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        transfer={selectedTransfer}
        onSuccess={handleCompleteSuccess}
      />

      <CancelTransferDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        transfer={selectedTransfer}
        onSuccess={handleCancelSuccess}
      />
    </div>
  );
}
