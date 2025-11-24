// app/dashboard/settings/locations/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LocationsPage() {
  const [locations, setLocations] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
    warehouseId: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWarehouses();
    fetchLocations();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch("/api/warehouses");
      const data = await response.json();
      if (data.success) setWarehouses(data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      if (data.success) setLocations(data.data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch locations",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/locations/${editingId}` : "/api/locations";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        fetchLocations();
        closeModal();
        toast({
          title: "Success",
          description: `Location ${editingId ? "updated" : "created"
            } successfully`,
        });
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
        description: "Failed to save location",
      });
    }
  };

  const handleEdit = async (id: string) => {
    const response = await fetch(`/api/locations/${id}`);
    const data = await response.json();
    if (data.success) {
      setFormData({
        name: data.data.name || "",
        shortCode: data.data.shortCode || "",
        warehouseId: data.data.warehouseId || "",
      });
      setEditingId(id);
      setShowModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchLocations();
        toast({
          title: "Success",
          description: "Location deleted successfully",
        });
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
        description: "Failed to delete location",
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "", shortCode: "", warehouseId: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">location</h1>
          <p className="text-muted-foreground">
            Manage storage locations within warehouses
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Short Code</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <p className="text-muted-foreground">No locations found</p>
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      {location.name}
                    </TableCell>
                    <TableCell>{location.shortCode}</TableCell>
                    <TableCell>{location.warehouse?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(location.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(location.id)}
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Location" : "Create Location"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter location name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortCode">Short Code</Label>
              <Input
                id="shortCode"
                required
                value={formData.shortCode}
                onChange={(e) =>
                  setFormData({ ...formData, shortCode: e.target.value })
                }
                placeholder="Enter short code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">warehouse</Label>
              <Select
                required
                value={formData.warehouseId}
                onValueChange={(value) =>
                  setFormData({ ...formData, warehouseId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="WH" />
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
