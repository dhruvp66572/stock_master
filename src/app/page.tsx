import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Warehouse, TruckIcon, BarChart3 } from "lucide-react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                        Welcome to{" "}
                        <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                            StockMaster
                        </span>
                    </h1>
                    <p className="mt-6 text-xl text-muted-foreground sm:text-2xl">
                        Digitize and streamline all stock-related operations
                    </p>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        A modern inventory management system built for efficient stock
                        control, warehouse management, and seamless order tracking.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="text-lg px-8">
                            <Link href="/auth/signup">Get Started</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="text-lg px-8">
                            <Link href="/auth/login">Sign In</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gray-50 py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        Key Features
                    </h2>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
                            <div className="rounded-full bg-primary/10 p-3 mb-4">
                                <Package className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Product Management</h3>
                            <p className="text-sm text-muted-foreground">
                                Manage your inventory with categories, SKUs, and stock levels
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
                            <div className="rounded-full bg-primary/10 p-3 mb-4">
                                <Warehouse className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Warehouse Tracking
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Track stock across multiple warehouse locations
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
                            <div className="rounded-full bg-primary/10 p-3 mb-4">
                                <TruckIcon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Receipts & Deliveries
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Manage incoming and outgoing stock transactions
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
                            <div className="rounded-full bg-primary/10 p-3 mb-4">
                                <BarChart3 className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Analytics Dashboard
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Real-time insights and stock movement history
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
