import bcrypt from "bcryptjs";

/**
 * Hash a password using bcryptjs
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a 6-digit OTP
 * @returns 6-digit OTP as string
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if OTP has expired
 * @param expiryDate - OTP expiry date from database
 * @returns True if expired, false otherwise
 */
export function isOTPExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid email format, false otherwise
 */
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
