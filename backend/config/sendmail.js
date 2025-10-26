import emailQueue from './emailQueue.js';

// Add email to queue instead of sending directly
const sendMail = async({email, subject, html}) => {
    try {
        console.log(`📬 Attempting to queue email for: ${email}, Subject: ${subject}`);

        // Add job to queue - this returns immediately without blocking
        const job = await emailQueue.add({
            email,
            subject,
            html
        }, {
            priority: subject.includes('OTP') || subject.includes('Otp') ? 1 : 5, // Higher priority for OTP emails
            removeOnComplete: true,
            removeOnFail: false
        });

        console.log(`✅ Email job ${job.id} queued successfully for: ${email}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Priority: ${subject.includes('OTP') || subject.includes('Otp') ? 'HIGH (OTP)' : 'NORMAL'}`);

        return { success: true, jobId: job.id };
    } catch (error) {
        console.error('❌ Failed to queue email:', error.message);
        console.error('   Email:', email);
        console.error('   Subject:', subject);
        throw error;
    }
}

export default sendMail;