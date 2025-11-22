import nodemailer from "nodemailer";

interface EmailResponse {
    success: boolean;
    error?: string;
}

/**
 * Send OTP email to user for password reset
 * @param email - Recipient email address
 * @param otp - 6-digit OTP code
 * @returns Success status and error message if failed
 */
export async function sendOTPEmail(
    email: string,
    otp: string
): Promise<EmailResponse> {
    try {
        // Create transporter with SMTP configuration
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        // Define email content
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "StockMaster - Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}\n\nThis OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.\n\nIf you didn't request this, please ignore this email.`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .otp-box { background-color: white; border: 2px solid #4F46E5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>StockMaster</h1>
              </div>
              <div class="content">
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password. Use the OTP below to complete the process:</p>
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                <p><strong>This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</strong></p>
                <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 StockMaster. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
        };

        // Send email
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send email",
        };
    }
}
