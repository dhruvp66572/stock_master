"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface StockRecord {
    id: string;
    name: string;
    sku: string;
    category: {
        name: string;
    };
    warehouse: {
        name: string;
        location?: string;
    };
    stock: number;
    minStockLevel: number | null;
    unitOfMeasure: string;
    stockStatus: "out" | "low" | "ok";
}

export default function StockPage() {
    const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [warehouseFilter, setWarehouseFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categories, setCategories] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchStockRecords();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryFilter, warehouseFilter, statusFilter]);

    const fetchFilters = async () => {
        try {
            const response = await fetch("/api/dashboard/filters");
            if (!response.ok) throw new Error("Failed to fetch filters");
            const data = await response.json();
            setCategories(data.categories || []);
            setWarehouses(data.warehouses || []);
        } catch (error) {
            console.error("Error fetching filters:", error);
            toast.error("Failed to load filters");
        }
    };

    const fetchStockRecords = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);
            if (categoryFilter !== "all") params.append("categoryId", categoryFilter);
            if (warehouseFilter !== "all") params.append("warehouseId", warehouseFilter);
            if (statusFilter !== "all") params.append("status", statusFilter);

            const response = await fetch(`/api/stock?${params}`);
            if (!response.ok) throw new Error("Failed to fetch stock records");

            const data = await response.json();
            setStockRecords(data.data || []);
        } catch (error) {
            console.error("Error fetching stock records:", error);
            toast.error("Failed to load stock records");
        } finally {
            setLoading(false);
        }
    };

    const getStockStatusBadge = (status: string, stock: number) => {
        if (status === "out") {
            return (
                <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Out of Stock
                </Badge>
            );
        }
        if (status === "low") {
            return (
                <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                </Badge>
            );
        }
        return (
            <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3" />
                In Stock
            </Badge>
        );
    };

    const totalStock = stockRecords.reduce((sum, record) => sum + record.stock, 0);
    const outOfStock = stockRecords.filter((r) => r.stockStatus === "out").length;
    const lowStock = stockRecords.filter((r) => r.stockStatus === "low").length;
    const inStock = stockRecords.filter((r) => r.stockStatus === "ok").length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Stock Overview</h1>
                    <p className="text-muted-foreground">
                        Monitor stock levels across all warehouses
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stockRecords.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Stock</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{inStock}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{lowStock}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{outOfStock}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Stock Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Warehouses" />
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

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="ok">In Stock</SelectItem>
                                <SelectItem value="low">Low Stock</SelectItem>
                                <SelectItem value="out">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead className="text-right">Stock Qty</TableHead>
                                        <TableHead className="text-right">Min Level</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stockRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package className="h-12 w-12 text-muted-foreground" />
                                                    <p className="text-muted-foreground">No stock records found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        stockRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {record.sku}
                                                </TableCell>
                                                <TableCell className="font-medium">{record.name}</TableCell>
                                                <TableCell>{record.category.name}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{record.warehouse.name}</div>
                                                        {record.warehouse.location && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {record.warehouse.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {record.stock}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {record.minStockLevel || "-"}
                                                </TableCell>
                                                <TableCell>{record.unitOfMeasure}</TableCell>
                                                <TableCell>
                                                    {getStockStatusBadge(record.stockStatus, record.stock)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
