import cron from 'node-cron';
import Schedule from '../models/Schedule.js';
import { sendMedicationReminder } from '../services/notificationService.js';
import { getIstDayBounds } from '../utils/istDate.js';

const formatReminderTime = (time) => {
  const [hourText, minute = '00'] = time.split(':');
  const hour = Number.parseInt(hourText, 10);
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
};

/**
 * Checks all active schedules in the database and triggers reminders for medications
 * scheduled in the current time slot.
 */
export const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    
    // Get current time formatted as "HH:MM" in Indian Standard Time (IST)
    const options = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false };
    const currentTimeStr = now.toLocaleTimeString('en-US', options);

    console.log(`[Reminder Job] Waking up. Current time (IST): ${currentTimeStr}. Checking schedules...`);

    // Medication dates are calendar dates in India, so boundaries must not
    // depend on the server's timezone (which is commonly UTC in production).
    const { start: todayStart, end: todayEnd } = getIstDayBounds(now);

    // Query active schedules containing at least one medication active today in this time slot
    const activeSchedules = await Schedule.find({
      isActive: true,
      patientPhone: { $exists: true, $ne: null, $ne: '' },
      medications: {
        $elemMatch: {
          startDate: { $lte: todayEnd },
          endDate: { $gte: todayStart },
          scheduledTimes: currentTimeStr,
          $or: [
            { reminderEnabled: true },
            // Schedules created before the reminder switch was introduced
            // remain active until a user chooses to pause them.
            { reminderEnabled: { $exists: false } },
          ],
        },
      },
    }).populate('prescriptionId');

    if (activeSchedules.length === 0) {
      console.log('[Reminder Job] No reminders to send in this slot.');
      return;
    }

    console.log(`[Reminder Job] Found ${activeSchedules.length} active schedule(s) with matching reminders.`);

    for (const schedule of activeSchedules) {
      const patientPhone = schedule.patientPhone;
      const patientName = schedule.prescriptionId?.extractedData?.patient?.name || 'Patient';

      // Find the specific medications that need reminders in this time slot
      const matchingMeds = schedule.medications.filter((med) => {
        const inDateRange = med.startDate <= todayEnd && med.endDate >= todayStart;
        const matchesTime = med.scheduledTimes.includes(currentTimeStr);
        return med.reminderEnabled !== false && inDateRange && matchesTime;
      });

      if (matchingMeds.length === 0) continue;

      try {
        console.log(
          `[Reminder Job] Dispatching one reminder to ${patientName} (${patientPhone}) for ${matchingMeds.length} medication(s).`,
        );

        // The template's third parameter is a newline-separated bulleted list,
        // allowing one WhatsApp message to cover every medicine due right now.
        await sendMedicationReminder(
          patientPhone,
          patientName,
          formatReminderTime(currentTimeStr),
          matchingMeds,
          'medication_reminder_v3',
        );
      } catch (err) {
        console.error(
          `[Reminder Job] Failed to send grouped reminder to ${patientPhone}:`,
          err.message,
        );
      }
    }
  } catch (error) {
    console.error('[Reminder Job] Error executing checkAndSendReminders:', error);
  }
};

/**
 * Initializes the node-cron scheduler to execute every minute.
 */
export const initReminderJob = () => {
  // Cron syntax: * * * * * runs every minute
  cron.schedule('* * * * *', () => {
    checkAndSendReminders();
  });
  console.log('[Reminder Job] Cron scheduler initialized to run every minute.');
};
