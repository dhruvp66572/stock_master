// app/dashboard/deliveries/[id]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useToast } from "@/hooks/use-toast";

export default function DeliveryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const isNew = params.id === "new";
  const { toast } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customerName: "",
    warehouseId: "",
    notes: "",
    status: "DRAFT",
  });
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
    if (!isNew) {
      fetchDelivery();
    }
  }, []);

  const fetchWarehouses = async () => {
    const response = await fetch("/api/warehouses");
    const data = await response.json();
    if (data.success) setWarehouses(data.data);
  };

  const fetchProducts = async () => {
    const response = await fetch("/api/products");
    const data = await response.json();
    if (data.success) setProducts(data.data);
  };

  const fetchDelivery = async () => {
    try {
      const response = await fetch(`/api/deliveries/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setFormData({
          customerName: data.data.customerName,
          warehouseId: data.data.warehouseId,
          notes: data.data.notes || "",
          status: data.data.status,
        });
        setItems(data.data.items || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    if (!selectedProduct || !quantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select product and quantity",
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const existingItem = items.find((i) => i.productId === selectedProduct);
    if (existingItem) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Product already added",
      });
      return;
    }

    setItems([
      ...items,
      {
        productId: selectedProduct,
        product,
        quantity: parseInt(quantity),
      },
    ]);
    setSelectedProduct("");
    setQuantity("");
  };

  const removeProduct = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const handleSave = async (newStatus?: string) => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please login to continue",
      });
      return;
    }

    if (!formData.customerName || !formData.warehouseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill customer name and warehouse",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one product",
      });
      return;
    }

    try {
      const url = isNew ? "/api/deliveries" : `/api/deliveries/${params.id}`;
      const method = isNew ? "POST" : "PATCH";

      const payload = {
        ...formData,
        ...(newStatus && { status: newStatus }),
        userId: session.user.id,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: "Success",
          description: `Delivery ${isNew ? "created" : "updated"} successfully`,
        });
        router.push("/dashboard/deliveries");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save delivery",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNew ? "New Delivery" : "Delivery Details"}
          </h1>
        </div>
        {!isNew && <Badge className="ml-auto">{formData.status}</Badge>}
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Enter customer name"
                  disabled={formData.status === "DONE"}
                />
              </div>

              <div className="space-y-2">
                <Label>Warehouse *</Label>
                <Select
                  value={formData.warehouseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, warehouseId: value })
                  }
                  disabled={formData.status === "DONE"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Enter notes"
                disabled={formData.status === "DONE"}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.status !== "DONE" && (
              <div className="flex gap-4">
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-32"
                />

                <Button onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Quantity</TableHead>
                  {formData.status !== "DONE" && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No products added
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.product.sku}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      {formData.status !== "DONE" && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProduct(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          {formData.status === "DRAFT" && (
            <>
              <Button onClick={() => handleSave()}>Save as Draft</Button>
              <Button onClick={() => handleSave("READY")}>Mark as Ready</Button>
            </>
          )}
          {formData.status === "READY" && (
            <Button onClick={() => handleSave("DONE")}>
              Validate & Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}