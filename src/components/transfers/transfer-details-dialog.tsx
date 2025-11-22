"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, ArrowRight } from "lucide-react";
import type { Transfer } from "@/types/transfer";

interface TransferDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
}

export function TransferDetailsDialog({
  open,
  onOpenChange,
  transfer,
}: TransferDetailsDialogProps) {
  if (!transfer) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string }> = {
      DRAFT: { className: "bg-slate-100 text-slate-700" },
      IN_TRANSIT: { className: "bg-blue-100 text-blue-700" },
      COMPLETED: { className: "bg-green-100 text-green-700" },
      CANCELED: { className: "bg-red-100 text-red-700" },
    };

    const config = variants[status] || variants.DRAFT;
    return (
      <Badge className={config.className}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById("transfer-print-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transfer ${transfer.transferNumber}</title>
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
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section {
              border: 1px solid #e5e7eb;
              padding: 15px;
              border-radius: 8px;
            }
            .info-section h3 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #6b7280;
              text-transform: uppercase;
            }
            .info-section p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
            }
            .status-draft { background-color: #f1f5f9; color: #475569; }
            .status-in-transit { background-color: #dbeafe; color: #1e40af; }
            .status-completed { background-color: #dcfce7; color: #15803d; }
            .status-canceled { background-color: #fee2e2; color: #991b1b; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      DRAFT: "status-draft",
      IN_TRANSIT: "status-in-transit",
      COMPLETED: "status-completed",
      CANCELED: "status-canceled",
    };
    return classes[status] || classes.DRAFT;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Transfer Details</DialogTitle>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </DialogHeader>

        <div id="transfer-print-content">
          {/* Print Header */}
          <div className="header" style={{ textAlign: "center", marginBottom: "30px" }}>
            <h1 style={{ margin: 0, fontSize: "24px" }}>Internal Transfer Document</h1>
            <p style={{ margin: "10px 0 0 0", color: "#6b7280" }}>
              Transfer #{transfer.transferNumber}
            </p>
          </div>

          {/* Transfer Info */}
          <div className="info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
            <div className="info-section" style={{ border: "1px solid #e5e7eb", padding: "15px", borderRadius: "8px" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#6b7280", textTransform: "uppercase" }}>
                Transfer Information
              </h3>
              <p style={{ margin: "5px 0" }}>
                <strong>Status:</strong>{" "}
                <span className={`status-badge ${getStatusClass(transfer.status)}`}>
                  {transfer.status.replace("_", " ")}
                </span>
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>Created:</strong> {formatDate(transfer.createdAt)}
              </p>
              {transfer.completedAt && (
                <p style={{ margin: "5px 0" }}>
                  <strong>Completed:</strong> {formatDate(transfer.completedAt)}
                </p>
              )}
              <p style={{ margin: "5px 0" }}>
                <strong>Created By:</strong> {transfer.user.name || transfer.user.email}
              </p>
            </div>

            <div className="info-section" style={{ border: "1px solid #e5e7eb", padding: "15px", borderRadius: "8px" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#6b7280", textTransform: "uppercase" }}>
                Warehouse Transfer
              </h3>
              <p style={{ margin: "5px 0" }}>
                <strong>From:</strong> {transfer.fromWarehouse.name}
                {transfer.fromWarehouse.location && ` (${transfer.fromWarehouse.location})`}
              </p>
              <p style={{ margin: "5px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#6b7280" }}>→</span>
              </p>
              <p style={{ margin: "5px 0" }}>
                <strong>To:</strong> {transfer.toWarehouse.name}
                {transfer.toWarehouse.location && ` (${transfer.toWarehouse.location})`}
              </p>
            </div>
          </div>

          {/* Notes */}
          {transfer.notes && (
            <div className="info-section" style={{ border: "1px solid #e5e7eb", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#6b7280", textTransform: "uppercase" }}>
                Notes
              </h3>
              <p style={{ margin: 0 }}>{transfer.notes}</p>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", fontWeight: 600 }}>
              Transfer Items
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfer.items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.product.sku}</TableCell>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.product.unitOfMeasure}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Total Items:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {transfer.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="footer" style={{ marginTop: "40px", paddingTop: "20px", borderTop: "2px solid #e5e7eb", textAlign: "center", color: "#6b7280", fontSize: "12px" }}>
            <p style={{ margin: 0 }}>
              This is an official transfer document generated by StockMaster Inventory Management System
            </p>
            <p style={{ margin: "5px 0 0 0" }}>
              Printed on {formatDate(new Date())}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
