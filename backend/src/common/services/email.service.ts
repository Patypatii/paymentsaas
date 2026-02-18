import axios from 'axios';

interface EmailOptions {
    to: { name?: string; email: string }[];
    subject: string;
    htmlContent: string;
    sender?: { name: string; email: string };
}

export class EmailService {
    private static readonly API_URL = 'https://api.brevo.com/v3/smtp/email';

    private static get API_KEY() {
        return process.env.BREVO_API_KEY;
    }

    private static get DEFAULT_SENDER() {
        return {
            name: process.env.EMAIL_FROM_NAME || 'Paylor',
            email: process.env.EMAIL_FROM_ADDRESS || 'noreply@paylor.com'
        };
    }

    /**
     * Send an email using Brevo HTTP API
     */
    static async send(options: EmailOptions): Promise<boolean> {
        if (!this.API_KEY) {
            console.warn('⚠️ BREVO_API_KEY is not set. Email not sent.');
            return false;
        }

        try {
            const payload = {
                sender: options.sender || this.DEFAULT_SENDER,
                to: options.to,
                subject: options.subject,
                htmlContent: options.htmlContent
            };

            const response = await axios.post(this.API_URL, payload, {
                headers: {
                    'api-key': this.API_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log(`📧 Email sent successfully: ${response.data.messageId}`);
            return true;
        } catch (error: any) {
            console.error('❌ Failed to send email via Brevo:', error.response?.data || error.message);
            return false;
        }
    }

    /**
     * Wrap content in a branded HTML template
     */
    private static wrapInTemplate(title: string, content: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7f9; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e1e8ed; }
                    .header { background-color: #0066FF; padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
                    .content { padding: 40px; color: #334155; line-height: 1.6; }
                    .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #0066FF; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
                    .emoji { font-size: 20px; vertical-align: middle; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>${title}</h1>
                    </div>
                    <div class="content">
                        ${content}
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} Paylor. All rights reserved.<br>
                        Your Secure Payment Gateway Solution.
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Send Password Reset Email
     */
    static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        const html = this.wrapInTemplate('Reset Your Password', `
            <p>Hello,</p>
            <p>You requested to reset your password for your Paylor account.</p>
            <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
            <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
        `);

        return this.send({
            to: [{ email }],
            subject: 'Reset your Paylor Password',
            htmlContent: html
        });
    }

    /**
     * Send a Welcome Email
     */
    static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
        const html = this.wrapInTemplate('Welcome to Paylor!', `
            <p>Hello ${name},</p>
            <p>We're thrilled to have you on board! Paylor is designed to make your collections seamless and automated.</p>
            <p>You can now manage your payments, top up your wallet, and view analytics from your dashboard.</p>
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Go to Dashboard</a>
            </div>
            <p style="margin-top: 30px;">Need help? Reply to this email and our support team will assist you.</p>
        `);

        return this.send({
            to: [{ name, email }],
            subject: 'Welcome to Paylor!',
            htmlContent: html
        });
    }

    /**
     * Send Contact Notification to Admin
     */
    static async sendContactNotification(adminEmail: string, data: { firstName: string, lastName: string, email: string, message: string }): Promise<boolean> {
        const html = this.wrapInTemplate('New Contact Submission', `
            <p>A new message has been received from the website contact form.</p>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <p><strong>From:</strong> ${data.firstName} ${data.lastName} (${data.email})</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
        `);

        return this.send({
            to: [{ email: adminEmail, name: 'Paylor Admin' }],
            subject: `New Contact Form Submission: ${data.firstName} ${data.lastName}`,
            htmlContent: html,
            sender: { name: `${data.firstName} ${data.lastName}`, email: 'noreply@paylor.com' }
        });
    }

    /**
     * Send Payment Success Email to Merchant
     */
    static async sendPaymentSuccessEmail(
        merchantEmail: string,
        merchantName: string,
        payment: { amount: number, currency: string, reference: string, phone: string, mpesaReceipt?: string }
    ): Promise<boolean> {
        const receiptDisplay = payment.mpesaReceipt || payment.reference;
        const html = this.wrapInTemplate('Payment Successful <span class="emoji">💰✅</span>', `
            <p>Hello ${merchantName},</p>
            <p>Great news! You have received a successful payment through Paylor.</p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
                <p style="margin: 5px 0;"><strong>Amount:</strong> <span style="font-size: 18px; color: #166534;">${payment.currency} ${payment.amount.toLocaleString()}</span></p>
                <p style="margin: 5px 0;"><strong>Receipt:</strong> ${receiptDisplay}</p>
                <p style="margin: 5px 0;"><strong>Customer Phone:</strong> ${payment.phone}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>This transaction has been recorded in your dashboard and the funds (minus fees) have been settled accordingly.</p>
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/transactions" class="button">View Transaction</a>
            </div>
        `);

        return this.send({
            to: [{ name: merchantName, email: merchantEmail }],
            subject: `Payment Received: ${payment.currency} ${payment.amount} 💰✅`,
            htmlContent: html
        });
    }
}
