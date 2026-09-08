import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import './TriageDashboard.css';

// ─── PATIENT DATA ───────────────────────────────────────────────────────────
export const PATIENTS = [
  {
    id: 'P001',
    name: 'Ramesh Kumar',
    abhaId: '91-4829-1092-3810',
    age: 58,
    gender: 'Male',
    chiefComplaint: 'Severe chest pain radiating to left arm and jaw, onset 2 hours ago. Profuse sweating and breathlessness.',
    flagged: true,
    flagReason: 'Age 58 · Chest pain radiating to left arm — Cardiac emergency protocol',
    checkInTime: '09:14 AM',
    waitMins: 34,
    avatarColor: 'navy',
    aiSummary: 'Mr. Ramesh Kumar, 58M, presents with acute onset severe chest pain radiating to the left arm and jaw, accompanied by diaphoresis and dyspnoea for 2 hours. Clinical picture is highly suggestive of Acute Coronary Syndrome. Immediate ECG, troponin, and cardiology review are strongly indicated.',
    aiConfidence: 94,
    patientWords: '"I have been having a very heavy pain in my chest from morning, it is going to my left hand also. I am sweating a lot and feeling that something is pressing on my chest."',
    clinicalFrame: 'Substernal pressure-type chest pain with radiation to left arm/jaw, associated diaphoresis and dyspnoea — high-probability ACS presentation. ESI Level 1 (Immediate).',
    documents: {
      prescribingDoctor: 'Dr. P. K. Singh (MBBS, MD — Cardiology)',
      documentType: 'OPD Prescription',
      documentDate: '01/09/2026',
      medicines: [
        { name: 'Tab. Aspirin', dosage: '325 mg', frequency: 'Stat (loading dose)', duration: 'Single dose' },
        { name: 'Tab. Isosorbide Mononitrate', dosage: '5 mg', frequency: 'SL PRN chest pain', duration: '3 days' },
        { name: 'Inj. Morphine Sulphate', dosage: '2–4 mg IV', frequency: 'PRN if pain uncontrolled', duration: 'As needed' },
      ],
    },
    ayush: {
      prakriti: { vata: 45, pitta: 35, kapha: 20 },
      vikriti:  { vata: 55, pitta: 38, kapha: 7  },
    },
  },
  {
    id: 'P002',
    name: 'Sunita Devi',
    abhaId: '83-2910-4728-1193',
    age: 71,
    gender: 'Female',
    chiefComplaint: 'Sudden slurring of speech and right-sided facial drooping for the past 45 minutes. Unable to lift right arm.',
    flagged: true,
    flagReason: 'Age 71 · Sudden speech slurring + facial drooping — Stroke protocol',
    checkInTime: '09:28 AM',
    waitMins: 19,
    avatarColor: 'rose',
    aiSummary: 'Mrs. Sunita Devi, 71F, presents with acute onset dysarthria, right-sided facial palsy, and right arm weakness within the last 45 minutes — a classic stroke symptom triad (FAST positive). She is within the thrombolysis window. Immediate CT brain non-contrast and neurology alert are essential.',
    aiConfidence: 91,
    patientWords: '"My mouth is going crooked since morning and my speech is not coming properly. My right hand is also not feeling strong, it just feels heavy and cannot lift."',
    clinicalFrame: 'Acute dysarthria, right-sided UMN facial palsy, right hemiparesis — FAST score positive. Within 4.5-hour thrombolysis window. ESI Level 1 (Immediate).',
    documents: {
      prescribingDoctor: 'Dr. M. S. Rao (MBBS, DM — Neurology)',
      documentType: 'Emergency Referral Note',
      documentDate: '08/09/2026',
      medicines: [
        { name: 'Inj. Alteplase (tPA)', dosage: '0.9 mg/kg IV', frequency: 'Stat if CT negative for bleed', duration: 'Single infusion' },
        { name: 'Tab. Aspirin', dosage: '300 mg', frequency: 'Stat (post CT clearance)', duration: 'Single dose' },
        { name: 'Inj. Normal Saline', dosage: '0.9% 500 mL IV', frequency: 'Continuous', duration: 'Until stable' },
      ],
    },
    ayush: {
      prakriti: { vata: 50, pitta: 25, kapha: 25 },
      vikriti:  { vata: 65, pitta: 20, kapha: 15  },
    },
  },
  {
    id: 'P003',
    name: 'Anil Mehta',
    abhaId: '77-6612-3041-8827',
    age: 42,
    gender: 'Male',
    chiefComplaint: 'Persistent dry cough and low-grade fever for 10 days. Mild fatigue, no breathlessness at rest.',
    flagged: false,
    checkInTime: '09:02 AM',
    waitMins: 51,
    avatarColor: 'teal',
    aiSummary: 'Mr. Anil Mehta, 42M, presents with a 10-day history of dry cough, low-grade fever and fatigue without dyspnoea at rest. Differential includes upper respiratory tract infection, atypical pneumonia, or early pulmonary TB — sputum AFB and chest X-ray recommended.',
    aiConfidence: 78,
    patientWords: '"I have had a dry cough for the past 10 days, it is not getting better with the cough syrup I bought from the medical store. I also have some fever in the evenings."',
    clinicalFrame: 'Subacute dry cough (10 days) with low-grade pyrexia, evening predominance — atypical chest infection / TB screen warranted. ESI Level 4 (Non-Urgent).',
    documents: {
      prescribingDoctor: 'Dr. R. Gupta (MBBS, MD — Pulmonology)',
      documentType: 'OPD Prescription',
      documentDate: '30/08/2026',
      medicines: [
        { name: 'Tab. Azithromycin', dosage: '500 mg', frequency: 'Once daily', duration: '5 days' },
        { name: 'Tab. Paracetamol', dosage: '650 mg', frequency: 'TDS (if fever >101°F)', duration: '5 days' },
        { name: 'Syp. Dextromethorphan', dosage: '10 mL', frequency: 'TDS', duration: '5 days' },
      ],
    },
    ayush: {
      prakriti: { vata: 30, pitta: 50, kapha: 20 },
      vikriti:  { vata: 35, pitta: 55, kapha: 10 },
    },
  },
  {
    id: 'P004',
    name: 'Priya Nair',
    abhaId: '62-8830-5519-4401',
    age: 34,
    gender: 'Female',
    chiefComplaint: 'Bilateral knee pain, worse in mornings, for 3 months. Stiffness lasting approximately 30 minutes after waking.',
    flagged: false,
    checkInTime: '09:35 AM',
    waitMins: 14,
    avatarColor: 'teal',
    aiSummary: 'Ms. Priya Nair, 34F, reports a 3-month history of bilateral knee arthralgia with early morning stiffness lasting ~30 minutes — a pattern consistent with early inflammatory arthritis (RA vs reactive). Anti-CCP antibodies, RF, ESR, and CRP are recommended.',
    aiConfidence: 82,
    patientWords: '"My both knees have been paining since 3 months, the pain is worst when I wake up in the morning and my knees feel very stiff. After around 30 minutes they loosen up a little."',
    clinicalFrame: 'Bilateral polyarthralgia with 30-min morning stiffness — inflammatory pattern. RA vs reactive arthritis workup warranted. ESI Level 4 (Non-Urgent).',
    documents: {
      prescribingDoctor: 'Dr. S. Krishnan (MBBS, MD — Rheumatology)',
      documentType: 'OPD Follow-up Note',
      documentDate: '22/08/2026',
      medicines: [
        { name: 'Tab. Hydroxychloroquine', dosage: '200 mg', frequency: 'BD', duration: '3 months' },
        { name: 'Tab. Naproxen', dosage: '500 mg', frequency: 'BD with food', duration: '14 days' },
        { name: 'Tab. Folic Acid', dosage: '5 mg', frequency: 'Once daily', duration: '3 months' },
      ],
    },
    ayush: {
      prakriti: { vata: 40, pitta: 30, kapha: 30 },
      vikriti:  { vata: 55, pitta: 30, kapha: 15 },
    },
  },
  {
    id: 'P005',
    name: 'Vikram Joshi',
    abhaId: '54-1194-7732-6650',
    age: 29,
    gender: 'Male',
    chiefComplaint: 'Severe migraine with visual aura, nausea and photophobia. Third episode this month.',
    flagged: false,
    checkInTime: '09:48 AM',
    waitMins: 1,
    avatarColor: 'navy',
    aiSummary: 'Mr. Vikram Joshi, 29M, presents with recurrent episodic severe headache with visual aura, nausea and photophobia — consistent with migraine with aura (IHS criteria met). Third episode in 4 weeks suggests need for preventive therapy review.',
    aiConfidence: 88,
    patientWords: '"I am having very bad headache from 2 hours. Before the headache starts I see zigzag lines and my vision goes blurry. Now I also have vomiting sensation and light is hurting my eyes."',
    clinicalFrame: 'Classic migraine with visual aura — third episode in 4 weeks. Acute abortive therapy indicated; preventive therapy threshold reached. ESI Level 3 (Urgent).',
    documents: {
      prescribingDoctor: 'Dr. N. Sharma (MBBS, DM — Neurology)',
      documentType: 'OPD Prescription',
      documentDate: '05/09/2026',
      medicines: [
        { name: 'Tab. Sumatriptan', dosage: '50 mg', frequency: 'Stat, repeat after 2h PRN', duration: 'Per episode' },
        { name: 'Tab. Metoclopramide', dosage: '10 mg', frequency: 'TDS (for nausea)', duration: '3 days' },
        { name: 'Tab. Propranolol', dosage: '40 mg', frequency: 'BD (preventive)', duration: '3 months' },
      ],
    },
    ayush: {
      prakriti: { vata: 55, pitta: 30, kapha: 15 },
      vikriti:  { vata: 60, pitta: 35, kapha: 5  },
    },
  },
];

// ─── AVATAR COLORS ──────────────────────────────────────────────────────────
const AVATAR_STYLES = {
  teal: { bg: 'linear-gradient(135deg,#0D9488,#059669)', color: 'white' },
  navy: { bg: 'linear-gradient(135deg,#1E3A5F,#2D5A8E)', color: 'white' },
  rose: { bg: 'linear-gradient(135deg,#BE123C,#E11D48)', color: 'white' },
};

const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// ─── PATIENT CARD ────────────────────────────────────────────────────────────
const PatientCard = ({ patient, isSelected, onClick }) => {
  const { flagged, avatarColor } = patient;
  const avStyle = AVATAR_STYLES[avatarColor] || AVATAR_STYLES.teal;

  return (
    <div
      className={`tq-card ${flagged ? 'flagged' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(patient)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(patient)}
    >
      {/* Left flag bar rendered via CSS ::before */}
      <div className="tq-card-inner">
        {/* Avatar */}
        <div className="tq-avatar" style={{ background: avStyle.bg, color: avStyle.color }}>
          {initials(patient.name)}
        </div>

        {/* Main content */}
        <div className="tq-content">
          <div className="tq-row-top">
            <div className="tq-name">{patient.name}</div>
            <div className="tq-wait">
              <Clock size={11} strokeWidth={2} />
              <span className="tq-wait-val">{patient.waitMins}m</span>
            </div>
          </div>

          <div className="tq-abha">
            <CheckCircle2 size={11} color="#0E7C66" strokeWidth={2.5} />
            <span>{patient.abhaId}</span>
          </div>

          <div className="tq-meta">{patient.age} yrs · {patient.gender}</div>

          <div className="tq-cc">
            <span className="tq-cc-label">CC:</span>
            {patient.chiefComplaint}
          </div>

          {flagged && (
            <div className="tq-flag-reason">
              <AlertTriangle size={12} strokeWidth={2.2} />
              {patient.flagReason}
            </div>
          )}
        </div>

        {/* Priority badge */}
        {flagged && (
          <div className="tq-priority-badge">
            <span className="tq-pulse-dot" />
            PRIORITY
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const TriageDashboard = ({ patients = PATIENTS, onSelectPatient, selectedPatientId }) => {
  const activePatients = patients.filter(p => p.status !== 'Completed');
  const flagged = activePatients.filter(p => p.flagged);
  const normal  = activePatients.filter(p => !p.flagged);

  return (
    <div className="tq-root">
      {/* Header */}
      <div className="tq-header">
        <div className="tq-header-left">
          <h1 className="tq-title">Today's Triage Queue</h1>
          <p className="tq-subtitle">Live waiting room queue & emergency risk priority assessment</p>
        </div>
        <div className="tq-status-pill">
          <Users size={13} strokeWidth={2} />
          <span>{activePatients.length} Waiting</span>
        </div>
      </div>

      <div className="tq-divider" />

      {/* Priority Section */}
      {flagged.length > 0 && (
        <>
          <div className="tq-section-label flagged-label">
            <span className="tq-pulse-dot red" />
            PRIORITY — IMMEDIATE ATTENTION ({flagged.length})
          </div>

          {flagged.map(p => (
            <PatientCard
              key={p.id}
              patient={p}
              isSelected={selectedPatientId === p.id}
              onClick={onSelectPatient}
            />
          ))}
        </>
      )}

      {/* Normal Section */}
      <div className="tq-section-label waiting-label">
        WAITING ({normal.length})
      </div>

      {normal.map(p => (
        <PatientCard
          key={p.id}
          patient={p}
          isSelected={selectedPatientId === p.id}
          onClick={onSelectPatient}
        />
      ))}
    </div>
  );
};

export default TriageDashboard;
