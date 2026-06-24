import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  drugName: { type: String, required: true },
  form: {
    type: String,
    enum: ['Tab', 'Cap', 'Syp', 'Inj', 'Drops', 'Gel', 'Cream', 'Ointment', null],
    default: null,
  },
  dosage: { type: String, default: null }, // e.g., "625mg"
  frequency: {
    morning: { type: Number, default: 0 },
    afternoon: { type: Number, default: 0 },
    night: { type: Number, default: 0 },
  },
  duration: {
    value: { type: Number, default: 0 },
    unit: { type: String, enum: ['days', 'weeks', 'months'], default: 'days' },
  },
  mealInstruction: {
    type: String,
    enum: ['before', 'after', 'with', null],
    default: null,
  },
  route: {
    type: String,
    enum: ['oral', 'topical', 'injection', null],
    default: null,
  },
  specialInstructions: { type: String, default: null },
});

const patientSchema = new mongoose.Schema({
  name: { type: String, default: null },
  age: { type: Number, default: null },
  gender: { type: String, enum: ['M', 'F', 'O', null], default: null },
});

const prescriptionSchema = new mongoose.Schema(
  {
    rawOcrText: { type: String, default: '' },
    extractedData: {
      clinicName: { type: String, default: null },
      doctorName: { type: String, default: null },
      date: { type: Date, default: null },
      patient: { type: patientSchema, default: () => ({}) },
      medications: [medicationSchema],
      advice: [{ type: String }],
      followUp: { type: Date, default: null },
      rawNotes: { type: String, default: null },
    },
    userVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
