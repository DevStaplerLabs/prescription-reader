import express from 'express';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// GET /api/schedules/active - Get the currently active medication schedule
router.get('/active', async (req, res, next) => {
  try {
    const activeSchedule = await Schedule.findOne({ isActive: true })
      .populate('prescriptionId')
      .sort({ createdAt: -1 });

    if (!activeSchedule) {
      return res.status(404).json({
        status: 'error',
        message: 'No active schedule found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { schedule: activeSchedule },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
