"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
    CredentialsSignin: "Invalid email or password. Please try again.",
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to access this resource.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication. Please try again.",
};

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessage = error
        ? errorMessages[error] || errorMessages.Default
        : errorMessages.Default;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-red-100 p-3">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">
                        Authentication Error
                    </CardTitle>
                    <CardDescription className="text-center">
                        {errorMessage}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-700">
                            If you continue to experience issues, please contact support or
                            try resetting your password.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button asChild className="w-full">
                        <Link href="/auth/login">Try Again</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">Loading...</div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}
