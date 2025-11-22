"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ProductListItem } from "@/types/product";
import type { Category } from "@/types/dashboard";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { toast } from "sonner";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: "", categoryId: "all" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductListItem | null>(null);

  // Fetch categories and warehouses on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/dashboard/filters");
        if (!response.ok) throw new Error("Failed to fetch filters");
        const data = await response.json();
        setCategories(data.categories || []);
        setWarehouses(data.warehouses || []);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Debounced search
  const debouncedFetchProducts = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Fetch products when filters change
  useEffect(() => {
    const cleanup = debouncedFetchProducts();
    return cleanup;
  }, [filters, debouncedFetchProducts]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.categoryId && filters.categoryId !== "all")
        params.append("categoryId", filters.categoryId);

      const response = await fetch(`/api/products?${params}`);

      console.log(response);

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ search: "", categoryId: "all" });
  };

  const hasActiveFilters = filters.search !== "" || filters.categoryId !== "all";

  const handleEdit = (product: ProductListItem) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (product: ProductListItem) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSuccess = (message?: string) => {
    fetchProducts();
    if (message) {
      toast.success(message);
    }
  };

  const getStockBadge = (status: "out" | "low" | "ok") => {
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
        <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory products
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Search by SKU */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by SKU</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by SKU..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, categoryId: value }))
                }
              >
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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-20 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                        <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-bold">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>{product.warehouse.name}</TableCell>
                    <TableCell>{product.unitOfMeasure}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{product.stock}</span>
                        {getStockBadge(product.stockStatus)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.minStockLevel !== null
                        ? product.minStockLevel
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProductFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        product={null}
        categories={categories}
        warehouses={warehouses}
        onSuccess={handleSuccess}
      />

      <ProductFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode="edit"
        product={selectedProduct}
        categories={categories}
        warehouses={warehouses}
        onSuccess={handleSuccess}
      />

      <DeleteProductDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={selectedProduct}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
