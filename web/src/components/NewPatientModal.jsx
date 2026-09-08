import React, { useState } from 'react';
import { X, UserPlus, Sparkles, AlertTriangle } from 'lucide-react';
import './NewPatientModal.css';

const NewPatientModal = ({ onClose, onAddPatient }) => {
  const [formData, setFormData] = useState({
    name: '',
    abhaId: '',
    age: '',
    gender: 'Male',
    department: 'General OPD',
    chiefComplaint: '',
    flagged: false,
    flagReason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.chiefComplaint) return;

    const newPatient = {
      id: `P${Math.floor(100 + Math.random() * 900)}`,
      caseId: `CS-2026-0${Math.floor(900 + Math.random() * 99)}`,
      name: formData.name,
      abhaId: formData.abhaId || `${Math.floor(10+Math.random()*89)}-${Math.floor(1000+Math.random()*8999)}-${Math.floor(1000+Math.random()*8999)}-${Math.floor(1000+Math.random()*8999)}`,
      age: parseInt(formData.age) || 35,
      gender: formData.gender,
      chiefComplaint: formData.chiefComplaint,
      flagged: formData.flagged,
      flagReason: formData.flagged ? (formData.flagReason || 'Priority Triage Flag') : '',
      status: 'Waiting',
      triageLevel: formData.flagged ? 'ESI-1 (Immediate)' : 'ESI-4 (Non-Urgent)',
      department: formData.department,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitMins: 0,
      avatarColor: formData.flagged ? 'rose' : 'teal',
      aiSummary: `Patient ${formData.name}, ${formData.age}${formData.gender[0]} presented with ${formData.chiefComplaint}. AI Triage recommends standard clinical protocol & vital check.`,
      aiConfidence: 90,
      patientWords: `"${formData.chiefComplaint}"`,
      clinicalFrame: `${formData.chiefComplaint} — Triage Intake logged.`,
      vitals: { bp: '120/80 mmHg', hr: '76 bpm', spo2: '98%', temp: '98.6 °F' },
      documents: {
        prescribingDoctor: 'Dr. Aditya Rao (MBBS, MD)',
        documentType: 'OPD Intake Note',
        documentDate: new Date().toLocaleDateString('en-GB'),
        medicines: [
          { name: 'Tab. Paracetamol', dosage: '650 mg', frequency: 'PRN', duration: '3 days' }
        ]
      },
      ayush: {
        prakriti: { vata: 34, pitta: 33, kapha: 33 },
        vikriti: { vata: 40, pitta: 40, kapha: 20 }
      }
    };

    onAddPatient(newPatient);
    onClose();
  };

  return (
    <div className="npm-backdrop" onClick={onClose}>
      <div className="npm-modal" onClick={e => e.stopPropagation()}>
        <div className="npm-header">
          <div className="npm-title-wrap">
            <UserPlus size={18} color="#0E7C66" />
            <h2>New Patient Check-in</h2>
          </div>
          <button className="npm-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="npm-form">
          <div className="npm-row">
            <div className="npm-field">
              <label>Full Patient Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="npm-field">
              <label>ABHA ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 91-4829-1092-3810"
                value={formData.abhaId}
                onChange={e => setFormData({...formData, abhaId: e.target.value})}
              />
            </div>
          </div>

          <div className="npm-row three">
            <div className="npm-field">
              <label>Age *</label>
              <input
                type="number"
                required
                placeholder="e.g. 45"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})}
              />
            </div>

            <div className="npm-field">
              <label>Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="npm-field">
              <label>Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData({...formData, department: e.target.value})}
              >
                <option>General OPD</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Pulmonology</option>
                <option>Rheumatology</option>
              </select>
            </div>
          </div>

          <div className="npm-field">
            <label>Chief Complaint / Symptoms *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe symptoms, duration, and patient words..."
              value={formData.chiefComplaint}
              onChange={e => setFormData({...formData, chiefComplaint: e.target.value})}
            />
          </div>

          <div className="npm-checkbox-row">
            <label className="npm-chk-lbl">
              <input
                type="checkbox"
                checked={formData.flagged}
                onChange={e => setFormData({...formData, flagged: e.target.checked})}
              />
              <span className="npm-chk-text">
                <AlertTriangle size={14} color="#EF4444" /> Mark as Emergency / Priority Red Alert
              </span>
            </label>
          </div>

          {formData.flagged && (
            <div className="npm-field">
              <label>Emergency Reason</label>
              <input
                type="text"
                placeholder="e.g. Severe chest pain / Acute Stroke protocol"
                value={formData.flagReason}
                onChange={e => setFormData({...formData, flagReason: e.target.value})}
              />
            </div>
          )}

          <div className="npm-footer">
            <button type="button" className="npm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="npm-btn-submit">
              <Sparkles size={16} /> Add to Triage Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientModal;
