import dns from 'dns';
// Set process DNS servers to Google and Cloudflare to resolve Atlas SRV records
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import prescriptionRouter from './src/routes/prescription.js';
import scheduleRouter from './src/routes/schedule.js';
import { initReminderJob } from './src/jobs/reminderJob.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize background jobs
initReminderJob();

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/prescriptions', prescriptionRouter);
app.use('/api/schedules', scheduleRouter);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Prescription Reader API is running successfully.'
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
