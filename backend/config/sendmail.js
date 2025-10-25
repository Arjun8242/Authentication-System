import emailQueue from './emailQueue.js';

// Add email to queue instead of sending directly
const sendMail = async({email, subject, html}) => {
    try {
        // Add job to queue - this returns immediately without blocking
        const job = await emailQueue.add({
            email,
            subject,
            html
        }, {
            priority: subject.includes('OTP') || subject.includes('Otp') ? 1 : 5, // Higher priority for OTP emails
        });

        console.log(`📬 Email job ${job.id} queued for: ${email}`);

        return { success: true, jobId: job.id };
    } catch (error) {
        console.error('❌ Failed to queue email:', error.message);
        throw error;
    }
}

export default sendMail;