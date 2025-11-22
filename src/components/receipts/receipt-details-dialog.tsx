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
import { Printer, X } from "lucide-react";

interface ReceiptDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    receiptId: string | null;
}

export function ReceiptDetailsDialog({
    open,
    onOpenChange,
    receiptId,
}: ReceiptDetailsDialogProps) {
    const [receipt, setReceipt] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && receiptId) {
            fetchReceiptDetails();
        }
    }, [open, receiptId]);

    const fetchReceiptDetails = async () => {
        if (!receiptId) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/receipts/${receiptId}`);
            if (!response.ok) throw new Error("Failed to fetch receipt details");
            const data = await response.json();
            setReceipt(data);
        } catch (error) {
            console.error("Error fetching receipt:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!receipt) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${receipt.receiptNumber}</title>
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
            .status-validated { background-color: #d1fae5; color: #065f46; }
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
            <h1>Receipt Details</h1>
            <p>Receipt #: ${receipt.receiptNumber}</p>
          </div>

          <div class="info-grid">
            <div>
              <div class="info-item">
                <div class="info-label">Received From:</div>
                <div>${receipt.supplierName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Warehouse:</div>
                <div>${receipt.warehouse?.name}${receipt.warehouse?.location ? ` - ${receipt.warehouse.location}` : ""}</div>
              </div>
            </div>
            <div>
              <div class="info-item">
                <div class="info-label">Status:</div>
                <div>
                  <span class="status status-${receipt.status.toLowerCase()}">${receipt.status}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Created:</div>
                <div>${new Date(receipt.createdAt).toLocaleString()}</div>
              </div>
              ${receipt.validatedAt ? `
              <div class="info-item">
                <div class="info-label">Validated:</div>
                <div>${new Date(receipt.validatedAt).toLocaleString()}</div>
              </div>
              ` : ""}
            </div>
          </div>

          ${receipt.notes ? `
          <div class="info-item">
            <div class="info-label">Notes:</div>
            <div>${receipt.notes}</div>
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
              ${receipt.items?.map((item: any) => `
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
            case "VALIDATED":
                return <Badge variant="default">VALIDATED</Badge>;
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
                        <DialogTitle>Receipt Details</DialogTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                disabled={!receipt}
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
                ) : receipt ? (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Receipt Number</p>
                                <p className="font-semibold">{receipt.receiptNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <div className="mt-1">{getStatusBadge(receipt.status)}</div>
                            </div>
                        </div>

                        <Separator />

                        {/* Receipt Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Received From</p>
                                <p className="font-medium">{receipt.supplierName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Warehouse</p>
                                <p className="font-medium">
                                    {receipt.warehouse?.name}
                                    {receipt.warehouse?.location && (
                                        <span className="text-muted-foreground text-sm">
                                            {" "}
                                            - {receipt.warehouse.location}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created By</p>
                                <p className="font-medium">
                                    {receipt.user?.name || receipt.user?.email || "Unknown"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created At</p>
                                <p className="font-medium">
                                    {new Date(receipt.createdAt).toLocaleString()}
                                </p>
                            </div>
                            {receipt.validatedAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Validated At</p>
                                    <p className="font-medium">
                                        {new Date(receipt.validatedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {receipt.notes && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                                    <p className="text-sm">{receipt.notes}</p>
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
                                    {receipt.items?.map((item: any) => (
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
                        No receipt data available
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
