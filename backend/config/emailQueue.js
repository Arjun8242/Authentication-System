import Queue from 'bull';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Parse Redis URL for Bull
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
}

// Create email queue using the same Redis connection
const emailQueue = new Queue('email', redisUrl, {
    redis: {
        tls: {
            rejectUnauthorized: false
        }
    },
    defaultJobOptions: {
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 2000 // Start with 2 second delay, then exponential backoff
        },
        removeOnComplete: true, // Remove completed jobs to save memory
        removeOnFail: false // Keep failed jobs for debugging
    }
});

// Event listeners for monitoring
emailQueue.on('completed', (job) => {
    console.log(`✅ Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
    console.error(`❌ Email job ${job.id} failed:`, err.message);
});

emailQueue.on('error', (error) => {
    console.error('❌ Email queue error:', error);
});

export default emailQueue;

