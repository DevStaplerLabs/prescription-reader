import mongoose from 'mongoose';

const scheduledMedicationSchema = new mongoose.Schema({
  drugName: { type: String, required: true },
  form: { type: String, default: null },
  dosage: { type: String, default: null },
  scheduledTimes: [{ type: String }], // ["08:00", "21:00"]
  // Controls whether this medication participates in the reminder job. Keeping
  // it on the medication lets a patient pause one medicine without cancelling
  // their entire prescription schedule.
  reminderEnabled: { type: Boolean, default: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  mealInstruction: {
    type: String,
    enum: ['before', 'after', 'with', null],
    default: null,
  },
  route: { type: String, default: null },
  specialInstructions: { type: String, default: null },
});

const scheduleSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: null,
    },
    patientPhone: { type: String, default: null },
    medications: [scheduledMedicationSchema],
    advice: [{ type: String }],
    appointments: [{ type: Date }],
    tests: [{ type: Date }],
    followUp: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
