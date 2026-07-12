import cron from 'node-cron';
import Schedule from '../models/Schedule.js';
import { sendMedicationReminder } from '../services/notificationService.js';

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

    // Define the start and end of today's date boundaries to check date ranges accurately
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

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

      for (const med of matchingMeds) {
        try {
          const dosage = med.dosage || (med.form ? `1 ${med.form}` : '1 dose');
          console.log(`[Reminder Job] Dispatching reminder to ${patientName} (${patientPhone}) for ${med.drugName} (${dosage})`);

          // For Phase 1, we send the "hello_world" test template.
          // Note: In sandbox, this defaults to static text, but we pass full variables to keep it scalable.
          await sendMedicationReminder(
            patientPhone,
            patientName,
            med.drugName,
            dosage,
            currentTimeStr,
            'medication_reminder'
          );
        } catch (err) {
          console.error(`[Reminder Job] Failed to send reminder for ${med.drugName} to ${patientPhone}:`, err.message);
        }
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
