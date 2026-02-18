import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { z } from 'zod';
import { EmailService } from '../../common/services/email.service';
import { AppError, ErrorCode } from '../../common/constants/errors';

const contactSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters long'),
});

export const contactController = {
    submitContact: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const validatedData = contactSchema.parse(req.body);

        const { firstName, lastName, email, message } = validatedData;

        // Send email to Admin
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'admin@paylor.com';

        const emailSent = await EmailService.sendContactNotification(adminEmail, {
            firstName,
            lastName,
            email,
            message
        });

        if (!emailSent) {
            throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to send contact email. Please try again later.', 500);
        }

        res.status(200).json({
            message: 'Your message has been sent successfully. We will get back to you soon!',
        });
    }),
};
