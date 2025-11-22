"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    Package,
    AlertTriangle,
    TruckIcon,
    Send,
    ArrowRightLeft,
} from "lucide-react";
import type {
    DashboardKPIs,
    DashboardFilters,
    FilterState,
} from "@/types/dashboard";

export default function DashboardPage() {
    const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const [filterState, setFilterState] = useState<FilterState>({
        warehouseId: "all",
        categoryId: "all",
        receiptStatus: "all",
        deliveryStatus: "all",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch filter options on mount
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await fetch("/api/dashboard/filters");
                if (!response.ok) throw new Error("Failed to fetch filters");
                const data = await response.json();
                setFilters(data);
            } catch (err) {
                console.error("Error fetching filters:", err);
                setError("Failed to load filter options");
            }
        };

        fetchFilters();
    }, []);

    // Fetch KPIs whenever filters change
    useEffect(() => {
        const fetchKPIs = async () => {
            setLoading(true);
            setError(null);

        try {
            const params = new URLSearchParams();
            if (filterState.warehouseId && filterState.warehouseId !== "all")
                params.append("warehouseId", filterState.warehouseId);
            if (filterState.categoryId && filterState.categoryId !== "all")
                params.append("categoryId", filterState.categoryId);
            if (filterState.receiptStatus && filterState.receiptStatus !== "all")
                params.append("receiptStatus", filterState.receiptStatus);
            if (filterState.deliveryStatus && filterState.deliveryStatus !== "all")
                params.append("deliveryStatus", filterState.deliveryStatus);                const response = await fetch(`/api/dashboard/kpis?${params}`);
                if (!response.ok) throw new Error("Failed to fetch KPIs");

                const data = await response.json();
                setKpis(data);
            } catch (err) {
                console.error("Error fetching KPIs:", err);
                setError("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchKPIs();
    }, [filterState]);

    const clearFilters = () => {
        setFilterState({
            warehouseId: "all",
            categoryId: "all",
            receiptStatus: "all",
            deliveryStatus: "all",
        });
    };

    const hasActiveFilters = Object.values(filterState).some((value) => value !== "all");

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Your inventory management overview
                </p>
            </div>

            {/* Filters Section */}
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Warehouse Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Warehouse</label>
                            <Select
                                value={filterState.warehouseId}
                                onValueChange={(value) =>
                                    setFilterState((prev) => ({ ...prev, warehouseId: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Warehouses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Warehouses</SelectItem>
                                    {filters?.warehouses.map((warehouse) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name} - {warehouse.location}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select
                                value={filterState.categoryId}
                                onValueChange={(value) =>
                                    setFilterState((prev) => ({ ...prev, categoryId: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {filters?.categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Receipt Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Receipt Status</label>
                            <Select
                                value={filterState.receiptStatus}
                                onValueChange={(value: any) =>
                                    setFilterState((prev) => ({ ...prev, receiptStatus: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {filters?.receiptStatuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Delivery Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Delivery Status</label>
                            <Select
                                value={filterState.deliveryStatus}
                                onValueChange={(value: any) =>
                                    setFilterState((prev) => ({ ...prev, deliveryStatus: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {filters?.deliveryStatuses.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error State */}
            {error && (
                <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{kpis?.totalProducts || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {kpis?.totalProducts === 0 ? "No products yet" : "In inventory"}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Low Stock / Out of Stock */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-2xl font-bold">
                                        {(kpis?.lowStockItems || 0) + (kpis?.outOfStockItems || 0)}
                                    </div>
                                    <div className="flex gap-1">
                                        {(kpis?.outOfStockItems || 0) > 0 && (
                                            <Badge variant="destructive">
                                                {kpis?.outOfStockItems} out
                                            </Badge>
                                        )}
                                        {(kpis?.lowStockItems || 0) > 0 && (
                                            <Badge variant="secondary">
                                                {kpis?.lowStockItems} low
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {(kpis?.lowStockItems || 0) + (kpis?.outOfStockItems || 0) === 0
                                        ? "All items stocked"
                                        : "Items need attention"}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Receipts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Receipts
                        </CardTitle>
                        <TruckIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {kpis?.pendingReceipts || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {kpis?.pendingReceipts === 0
                                        ? "No pending receipts"
                                        : "Awaiting processing"}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Deliveries */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Deliveries
                        </CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {kpis?.pendingDeliveries || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {kpis?.pendingDeliveries === 0
                                        ? "No pending deliveries"
                                        : "Awaiting shipment"}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Internal Transfers */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Internal Transfers
                        </CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {kpis?.internalTransfers || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {kpis?.internalTransfers === 0
                                        ? "No transfers yet"
                                        : "Stock movements"}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
