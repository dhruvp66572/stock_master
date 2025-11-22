import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, isOTPExpired } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, otp, password } = body;

        // Validate input
        const validationResult = resetPasswordSchema.safeParse({ otp, password, confirmPassword: password });
        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check if OTP matches
        if (user.resetToken !== otp) {
            return NextResponse.json(
                { error: "Invalid OTP" },
                { status: 400 }
            );
        }

        // Check if OTP is expired
        if (!user.resetTokenExpiry || isOTPExpired(user.resetTokenExpiry)) {
            return NextResponse.json(
                { error: "OTP has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update user password and clear OTP
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during password reset:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
