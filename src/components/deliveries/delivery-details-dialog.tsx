"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Printer } from "lucide-react";

interface DeliveryDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deliveryId: string | null;
}

export function DeliveryDetailsDialog({
    open,
    onOpenChange,
    deliveryId,
}: DeliveryDetailsDialogProps) {
    const [delivery, setDelivery] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && deliveryId) {
            fetchDeliveryDetails();
        }
    }, [open, deliveryId]);

    const fetchDeliveryDetails = async () => {
        if (!deliveryId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/deliveries/${deliveryId}`);
            if (!response.ok) throw new Error("Failed to fetch delivery details");
            const data = await response.json();
            setDelivery(data);
        } catch (error) {
            console.error("Error fetching delivery:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!delivery) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery ${delivery.deliveryNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
              font-weight: bold;
            }
            .status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-draft { background-color: #fef3c7; color: #92400e; }
            .status-ready { background-color: #dbeafe; color: #1e40af; }
            .status-done { background-color: #d1fae5; color: #065f46; }
            .status-canceled { background-color: #fee2e2; color: #991b1b; }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Delivery Details</h1>
            <p>Delivery #: ${delivery.deliveryNumber}</p>
          </div>

          <div class="info-grid">
            <div>
              <div class="info-item">
                <div class="info-label">Delivery Address:</div>
                <div>${delivery.deliveryAddress || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Warehouse:</div>
                <div>${delivery.warehouse?.name}${delivery.warehouse?.location ? ` - ${delivery.warehouse.location}` : ""}</div>
              </div>
              ${delivery.scheduleDate ? `
              <div class="info-item">
                <div class="info-label">Scheduled Date:</div>
                <div>${new Date(delivery.scheduleDate).toLocaleString()}</div>
              </div>
              ` : ""}
            </div>
            <div>
              <div class="info-item">
                <div class="info-label">Operation Type:</div>
                <div>${delivery.operationType}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status:</div>
                <div>
                  <span class="status status-${delivery.status.toLowerCase()}">${delivery.status}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Created:</div>
                <div>${new Date(delivery.createdAt).toLocaleString()}</div>
              </div>
              ${delivery.deliveredAt ? `
              <div class="info-item">
                <div class="info-label">Delivered:</div>
                <div>${new Date(delivery.deliveredAt).toLocaleString()}</div>
              </div>
              ` : ""}
            </div>
          </div>

          ${delivery.notes ? `
          <div class="info-item">
            <div class="info-label">Notes:</div>
            <div>${delivery.notes}</div>
          </div>
          ` : ""}

          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              ${delivery.items?.map((item: any) => `
                <tr>
                  <td>${item.product?.sku || "N/A"}</td>
                  <td>${item.product?.name || "Unknown Product"}</td>
                  <td>${item.quantity}</td>
                  <td>${item.product?.unitOfMeasure || ""}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Printed on ${new Date().toLocaleString()}</p>
            <p>StockMaster Inventory Management System</p>
          </div>
        </body>
      </html>
    `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "DRAFT":
                return <Badge variant="secondary">DRAFT</Badge>;
            case "READY":
                return <Badge>READY</Badge>;
            case "DONE":
                return <Badge variant="default">DONE</Badge>;
            case "CANCELED":
                return <Badge variant="destructive">CANCELED</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Delivery Details</DialogTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                disabled={!delivery}
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="space-y-4">
                        <div className="h-8 w-full animate-pulse rounded bg-muted" />
                        <div className="h-8 w-full animate-pulse rounded bg-muted" />
                        <div className="h-32 w-full animate-pulse rounded bg-muted" />
                    </div>
                ) : delivery ? (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Delivery Number</p>
                                <p className="font-semibold">{delivery.deliveryNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <div className="mt-1">{getStatusBadge(delivery.status)}</div>
                            </div>
                        </div>

                        <Separator />

                        {/* Delivery Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Delivery Address</p>
                                <p className="font-medium">{delivery.deliveryAddress || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Operation Type</p>
                                <p className="font-medium">
                                    <Badge variant={delivery.operationType === "INCREMENT" ? "default" : "secondary"}>
                                        {delivery.operationType}
                                    </Badge>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Warehouse</p>
                                <p className="font-medium">
                                    {delivery.warehouse?.name}
                                    {delivery.warehouse?.location && (
                                        <span className="text-muted-foreground text-sm">
                                            {" "}
                                            - {delivery.warehouse.location}
                                        </span>
                                    )}
                                </p>
                            </div>
                            {delivery.scheduleDate && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Scheduled Date</p>
                                    <p className="font-medium">
                                        {new Date(delivery.scheduleDate).toLocaleString()}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-muted-foreground">Created By</p>
                                <p className="font-medium">
                                    {delivery.user?.name || delivery.user?.email || "Unknown"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created At</p>
                                <p className="font-medium">
                                    {new Date(delivery.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {delivery.deliveredAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Delivered At</p>
                                    <p className="font-medium">
                                        {new Date(delivery.deliveredAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {delivery.notes && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                                    <p className="text-sm">{delivery.notes}</p>
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Items Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Items</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Unit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {delivery.items?.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-mono">
                                                {item.product?.sku || "N/A"}
                                            </TableCell>
                                            <TableCell>{item.product?.name || "Unknown Product"}</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>{item.product?.unitOfMeasure || ""}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No delivery data available
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
