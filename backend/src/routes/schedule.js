import express from 'express';
import mongoose from 'mongoose';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// GET /api/schedules/active - Get the currently active medication schedule for a patient
router.get('/active', async (req, res, next) => {
  try {
    const { patientPhone } = req.query;
    const query = { isActive: true };
    if (patientPhone) {
      query.patientPhone = patientPhone;
    }

    const activeSchedule = await Schedule.findOne(query)
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

// PATCH /api/schedules/:id/deactivate - Discontinue an active schedule
router.patch('/:id/deactivate', async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Schedule not found.',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Schedule discontinued successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/schedules/history - Get all past inactive schedules for a patient
router.get('/history', async (req, res, next) => {
  try {
    const { patientPhone } = req.query;
    if (!patientPhone) {
      return res.status(400).json({
        status: 'error',
        message: 'patientPhone query parameter is required.',
      });
    }
    const history = await Schedule.find({ patientPhone, isActive: false })
      .populate('prescriptionId')
      .sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      data: { history },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/schedules/:id/restore - Atomic restore of a past schedule
router.post('/:id/restore', async (req, res, next) => {
  const { id } = req.params;
  const { patientPhone } = req.body;
  if (!patientPhone) {
    return res.status(400).json({
      status: 'error',
      message: 'patientPhone is required in request body.',
    });
  }

  // Attempt using transactions if supported (will fail on standalone local DBs)
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    await Schedule.updateMany({ patientPhone, isActive: true }, { isActive: false }).session(session);

    const restored = await Schedule.findOneAndUpdate(
      { _id: id, patientPhone },
      { isActive: true },
      { new: true }
    ).populate('prescriptionId').session(session);

    if (!restored) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ status: 'error', message: 'Target schedule not found.' });
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      status: 'success',
      message: 'Schedule restored successfully.',
      data: { schedule: restored },
    });
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (_) {}
    }
    
    console.warn('[Schedule Router] Transaction failed, falling back to non-transactional atomic sequence...', err.message);

    // Fallback: non-transactional atomic sequence (for local testing on standalone DBs)
    try {
      await Schedule.updateMany({ patientPhone, isActive: true }, { isActive: false });
      const restored = await Schedule.findOneAndUpdate(
        { _id: id, patientPhone },
        { isActive: true },
        { new: true }
      ).populate('prescriptionId');

      if (!restored) {
        return res.status(404).json({ status: 'error', message: 'Target schedule not found.' });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Schedule restored successfully.',
        data: { schedule: restored },
      });
    } catch (fallbackErr) {
      next(fallbackErr);
    }
  }
});

export default router;
