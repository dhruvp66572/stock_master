"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Package, Warehouse, TruckIcon, BarChart3 } from "lucide-react";

export default function DashboardPage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">StockMaster</h1>
                            <p className="text-sm text-gray-600">
                                Welcome back, {session?.user?.name || "User"}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-right">
                                <p className="font-medium">{session?.user?.email}</p>
                                <p className="text-gray-600 capitalize">
                                    Role: {session?.user?.role?.toLowerCase()}
                                </p>
                            </div>
                            <Button onClick={() => signOut({ callbackUrl: "/" })} variant="outline">
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                    <p className="text-gray-600">
                        Your inventory management overview
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Products
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                No products yet
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                No warehouses yet
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Receipts
                            </CardTitle>
                            <TruckIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                No receipts yet
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Stock Movements
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                No movements yet
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Coming Soon Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Coming Soon</CardTitle>
                        <CardDescription>
                            Features currently in development
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h3 className="font-semibold">Product Management</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Add, edit, and delete products</li>
                                    <li>• Manage categories and SKUs</li>
                                    <li>• Track stock levels</li>
                                    <li>• Set minimum stock alerts</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold">Warehouse Operations</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Manage multiple warehouses</li>
                                    <li>• Receipt processing</li>
                                    <li>• Delivery management</li>
                                    <li>• Stock transfers</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
