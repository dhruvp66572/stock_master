import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SonnerToaster } from "@/components/ui/sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DashboardLayout>{children}</DashboardLayout>
            <SonnerToaster />
        </>
    );
}
