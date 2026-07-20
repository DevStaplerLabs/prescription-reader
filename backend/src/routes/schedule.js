import express from 'express';
import mongoose from 'mongoose';
import Schedule from '../models/Schedule.js';
import Patient from '../models/Patient.js';
import { getIstDayBounds, parseIstDate } from '../utils/istDate.js';

const router = express.Router();

const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

// GET /api/schedules/active - Get the currently active medication schedule for a patient
router.get('/active', async (req, res, next) => {
  try {
    const { patientPhone } = req.query;
    const query = { isActive: true };
    if (patientPhone) {
      let cleanPhone = patientPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
      }
      const patient = await Patient.findOne({ phone: cleanPhone });
      if (patient) {
        query.patientId = patient._id;
      } else {
        query.patientPhone = patientPhone;
      }
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

// PATCH /api/schedules/:id/medications/:medicationId - Update reminder settings for one medication
router.patch('/:id/medications/:medicationId', async (req, res, next) => {
  try {
    const { id, medicationId } = req.params;
    const { reminderEnabled, scheduledTimes, startDate, endDate } = req.body;

    if (!hasOwn(req.body, 'reminderEnabled') && !hasOwn(req.body, 'scheduledTimes') &&
        !hasOwn(req.body, 'startDate') && !hasOwn(req.body, 'endDate')) {
      return res.status(400).json({
        status: 'error',
        message: 'Provide at least one reminder setting to update.',
      });
    }

    if (hasOwn(req.body, 'reminderEnabled') && typeof reminderEnabled !== 'boolean') {
      return res.status(400).json({
        status: 'error',
        message: 'reminderEnabled must be a boolean.',
      });
    }

    if (hasOwn(req.body, 'scheduledTimes')) {
      if (!Array.isArray(scheduledTimes) || scheduledTimes.length === 0 ||
          scheduledTimes.some((time) => typeof time !== 'string' || !timePattern.test(time))) {
        return res.status(400).json({
          status: 'error',
          message: 'scheduledTimes must contain one or more times in HH:MM format.',
        });
      }
    }

    const parsedStartDate = hasOwn(req.body, 'startDate') ? parseIstDate(startDate) : null;
    const endDateStart = hasOwn(req.body, 'endDate') ? parseIstDate(endDate) : null;
    const parsedEndDate = endDateStart ? getIstDayBounds(endDateStart)?.end : null;
    if (
      (hasOwn(req.body, 'startDate') &&
        Number.isNaN(parsedStartDate?.getTime())) ||
      (hasOwn(req.body, 'endDate') &&
        (!parsedEndDate || Number.isNaN(parsedEndDate.getTime())))
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'startDate and endDate must be valid dates.',
      });
    }

    const schedule = await Schedule.findOne({ _id: id, 'medications._id': medicationId });
    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: 'Medication schedule not found.',
      });
    }

    const medication = schedule.medications.id(medicationId);
    const nextStartDate = parsedStartDate || medication.startDate;
    const nextEndDate = parsedEndDate || medication.endDate;
    if (nextStartDate > nextEndDate) {
      return res.status(400).json({
        status: 'error',
        message: 'End date must be on or after the start date.',
      });
    }

    if (hasOwn(req.body, 'reminderEnabled')) medication.reminderEnabled = reminderEnabled;
    if (hasOwn(req.body, 'scheduledTimes')) {
      medication.scheduledTimes = [...new Set(scheduledTimes)].sort();
    }
    if (parsedStartDate) medication.startDate = parsedStartDate;
    if (parsedEndDate) medication.endDate = parsedEndDate;

    await schedule.save();

    return res.status(200).json({
      status: 'success',
      message: 'Medication reminder updated successfully.',
      data: { medication },
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

    let cleanPhone = patientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    const query = { isActive: false };
    const patient = await Patient.findOne({ phone: cleanPhone });
    if (patient) {
      query.patientId = patient._id;
    } else {
      query.patientPhone = patientPhone;
    }

    const history = await Schedule.find(query)
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

  let cleanPhone = patientPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  const patient = await Patient.findOne({ phone: cleanPhone });
  const patientId = patient ? patient._id : null;

  const updateQuery = { isActive: true };
  const restoreQuery = { _id: id };

  if (patientId) {
    updateQuery.patientId = patientId;
    restoreQuery.patientId = patientId;
  } else {
    updateQuery.patientPhone = patientPhone;
    restoreQuery.patientPhone = patientPhone;
  }

  // Attempt using transactions if supported (will fail on standalone local DBs)
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    await Schedule.updateMany(updateQuery, { isActive: false }).session(session);

    const restored = await Schedule.findOneAndUpdate(
      restoreQuery,
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
      await Schedule.updateMany(updateQuery, { isActive: false });
      const restored = await Schedule.findOneAndUpdate(
        restoreQuery,
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
