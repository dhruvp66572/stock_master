"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    Settings,
    LogOut,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "Products",
        href: "/dashboard/products",
        icon: Package,
    },
    {
        name: "Receipts",
        href: "/dashboard/receipts",
        icon: ArrowDownToLine,
    },
    {
        name: "Deliveries",
        href: "/dashboard/deliveries",
        icon: ArrowUpFromLine,
    },
    {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/auth/login" });
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card">
            {/* Header */}
            <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold">StockMaster</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <Separator />

            {/* User Profile */}
            <div className="p-4">
                <div className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {session?.user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {session?.user?.email || ""}
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="mt-2 w-full justify-start text-muted-foreground hover:text-destructive"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
