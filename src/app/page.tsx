import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-8">
                <h1 className="text-6xl font-bold text-center">
                    Welcome to <span className="text-primary">StockMaster</span>
                </h1>
                <p className="text-xl text-center text-muted-foreground max-w-2xl">
                    A modern inventory management system built for efficient stock control,
                    warehouse management, and seamless order tracking.
                </p>
                <div className="flex gap-4 mt-8">
                    <Link href="/dashboard">
                        <Button size="lg">
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
