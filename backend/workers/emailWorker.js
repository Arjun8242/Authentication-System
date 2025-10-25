import emailQueue from '../config/emailQueue.js';
import { createTransport } from 'nodemailer';

// Create the email transporter
const createEmailTransport = () => {
    return createTransport({
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
    });
};

// Process email jobs
emailQueue.process(async (job) => {
    const { email, subject, html } = job.data;
    
    console.log(`📧 Processing email job ${job.id} for: ${email}`);
    
    try {
        const transport = createEmailTransport();
        
        const info = await transport.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject,
            html,
        });
        
        console.log(`✅ Email sent to ${email}:`, info.messageId);
        
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error.message);
        throw error; // This will trigger retry logic
    }
});

console.log('📬 Email worker started and listening for jobs...');

export default emailQueue;

