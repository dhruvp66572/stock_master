"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Plus, Eye, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import CreateReceiptDialog from "@/components/receipts/create-receipt-dialog";
import type {
  ReceiptStatus,
  DashboardFilters,
  Warehouse,
} from "@/types/dashboard";

type ReceiptListItem = {
  id: string;
  receiptNumber: string;
  supplierName: string;
  status: ReceiptStatus;
  createdAt: string;
  _count?: { items: number };
  items?: any[];
  warehouse?: { id: string; name: string; location?: string } | null;
};

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptListItem[] | null>(null);
  const [filters, setFilters] = useState<DashboardFilters | null>(null);
  const [filterState, setFilterState] = useState<{
    status: ReceiptStatus | "all";
    warehouseId: string | "all";
  }>({
    status: "all",
    warehouseId: "all",
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const hasActiveFilters =
    filterState.status !== "all" || filterState.warehouseId !== "all";

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch("/api/dashboard/filters");
        if (!res.ok) throw new Error("Failed to fetch filters");
        const data = await res.json();
        setFilters(data);
      } catch (err) {
        console.error("Error fetching filters:", err);
        setError("Failed to load filter options");
      }
    };

    fetchFilters();
  }, []);

  // Fetch receipts whenever filters or page change
  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filterState.status && filterState.status !== "all")
          params.append("status", filterState.status);
        if (filterState.warehouseId && filterState.warehouseId !== "all")
          params.append("warehouseId", filterState.warehouseId);
        params.append("page", String(pagination.page));
        params.append("limit", String(pagination.limit));

        const res = await fetch(`/api/receipts?${params.toString()}`);
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.error || "Failed to fetch receipts");
        }

        const data = await res.json();
        setReceipts(data.receipts || []);
        setPagination((p) => ({
          ...p,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }));
      } catch (err: any) {
        console.error("Error fetching receipts:", err);
        setError(err?.message || "Failed to load receipts");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [filterState, pagination.page, reloadToken]);

  const clearFilters = () => {
    setFilterState({ status: "all", warehouseId: "all" });
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const refresh = () => {
    // bump reload token to trigger receipts re-fetch
    setReloadToken((t) => t + 1);
  };

  const handleValidate = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/receipts/${id}/validate`, {
        method: "PUT",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || "Failed to validate receipt");
      }
      // Refresh list
      refresh();
    } catch (err: any) {
      console.error("Validation error:", err);
      setError(err?.message || "Failed to validate receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    // Placeholder for future cancel implementation
    console.log("Cancel receipt", id);
  };

  const onPrev = () => {
    setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }));
  };

  const onNext = () => {
    setPagination((p) => ({
      ...p,
      page: Math.min(p.totalPages || 1, p.page + 1),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground">
            Manage incoming stock receipts
          </p>
        </div>
        <div>
          <Button
            variant="default"
            size="default"
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Receipt
          </Button>
        </div>
      </div>

      <CreateReceiptDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refresh}
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filterState.status}
                onValueChange={(value: string) => {
                  setFilterState((prev) => ({
                    ...prev,
                    status: value as ReceiptStatus | "all",
                  }));
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {filters?.receiptStatuses?.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse</label>
              <Select
                value={filterState.warehouseId}
                onValueChange={(value: string) => {
                  setFilterState((prev) => ({
                    ...prev,
                    warehouseId: value as string | "all",
                  }));
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {filters?.warehouses?.map((w: Warehouse) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} - {w.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Receipts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-40 w-full animate-pulse rounded bg-muted" />
          ) : receipts && receipts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.receiptNumber}</TableCell>
                    <TableCell>{r.supplierName}</TableCell>
                    <TableCell>{r.warehouse?.name}</TableCell>
                    <TableCell>
                      {r._count?.items ?? r.items?.length} items
                    </TableCell>
                    <TableCell>
                      {r.status === "DRAFT" && (
                        <Badge variant="secondary">DRAFT</Badge>
                      )}
                      {r.status === "READY" && <Badge>READY</Badge>}
                      {r.status === "DONE" && <Badge>DONE</Badge>}
                      {r.status === "CANCELED" && (
                        <Badge variant="destructive">CANCELED</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {r.status === "DRAFT" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleValidate(r.id)}
                          >
                            TODO
                          </Button>
                        )}

                        {r.status === "READY" && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleValidate(r.id)}
                          >
                            <Check className="mr-2 h-4 w-4" /> Validate
                          </Button>
                        )}

                        {r.status === "DONE" && (
                          <Button variant="ghost" size="sm" disabled>
                            Done
                          </Button>
                        )}

                        {r.status === "DRAFT" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(r.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No receipts found. Try adjusting filters or create a new
                receipt.
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages || 1}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={pagination.page >= (pagination.totalPages || 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
