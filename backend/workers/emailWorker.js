import emailQueue from '../config/emailQueue.js';
import { createTransport } from 'nodemailer';

// Create the email transporter
const createEmailTransport = () => {
    return createTransport({
        host: "smtp.gmail.com",
        port: 587, // Changed from 465 to 587 (STARTTLS)
        secure: false, // Use STARTTLS instead of SSL
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Accept self-signed certificates
        }
    });
};

// Process email jobs with concurrency
emailQueue.process(5, async (job) => {
    const { email, subject, html } = job.data;

    console.log(`📧 Processing email job ${job.id} for: ${email}`);
    console.log(`📧 Subject: ${subject}`);

    try {
        const transport = createEmailTransport();

        // Verify SMTP connection first
        await transport.verify();
        console.log('✅ SMTP connection verified');

        const info = await transport.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject,
            html,
        });

        console.log(`✅ Email sent successfully!`);
        console.log(`   To: ${email}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}`);
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        console.error(`   Full error:`, error);
        throw error; // This will trigger retry logic
    }
});

// Handle worker errors
emailQueue.on('error', (error) => {
    console.error('❌ Email queue error:', error);
});

emailQueue.on('stalled', (job) => {
    console.warn(`⚠️ Email job ${job.id} stalled`);
});

console.log('📬 Email worker started and listening for jobs...');

export default emailQueue;

