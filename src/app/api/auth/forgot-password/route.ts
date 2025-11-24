import { NextResponse } from "next/server";
import { generateOTP } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validate input
        const validationResult = forgotPasswordSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.errors[0].message },
                { status: 400 }
            );
        }

        // Lazy-import prisma to avoid build-time instantiation
        const { prisma } = await import("@/lib/prisma");

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // For security, always return success even if user doesn't exist
        // This prevents email enumeration attacks
        if (!user) {
            return NextResponse.json(
                { message: "If the email exists, an OTP has been sent" },
                { status: 200 }
            );
        }

        // Generate OTP
        const otp = generateOTP();

        // Calculate expiry time
        const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10");
        const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);

        // Update user with OTP and expiry
        await prisma.user.update({
            where: { email },
            data: {
                resetToken: otp,
                resetTokenExpiry: expiryTime,
            },
        });

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp);

        if (!emailResult.success) {
            return NextResponse.json(
                { error: "Failed to send OTP email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "OTP sent to your email address" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during forgot password:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
