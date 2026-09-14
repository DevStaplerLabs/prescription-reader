import React, { useEffect, useState } from 'react';
import {
  CheckCircle2, Sparkles, FileText, Leaf, Check,
  ClipboardEdit, Info, X, HeartPulse, Clock
} from 'lucide-react';
import './PatientSummary.css';

// ─── AYUSH BAR ──────────────────────────────────────────────────────────────
const AyushBar = ({ vata, pitta, kapha }) => (
  <div className="ayush-bar-wrap">
    <div className="ayush-bar">
      <div
        className="ayush-seg vata"
        style={{ width: `${vata}%` }}
        title={`Vata ${vata}%`}
      >
        <span className="ayush-seg-label">Vata {vata}%</span>
      </div>
      <div
        className="ayush-seg pitta"
        style={{ width: `${pitta}%` }}
        title={`Pitta ${pitta}%`}
      >
        <span className="ayush-seg-label">Pitta {pitta}%</span>
      </div>
      <div
        className="ayush-seg kapha"
        style={{ width: `${kapha}%` }}
        title={`Kapha ${kapha}%`}
      >
        <span className="ayush-seg-label">Kapha {kapha}%</span>
      </div>
    </div>
  </div>
);

// ─── MAIN FANCY MODAL COMPONENT ──────────────────────────────────────────────
const PatientSummaryModal = ({ patient, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editable fields
  const [aiSummary, setAiSummary] = useState("");
  const [clinicalFrame, setClinicalFrame] = useState("");

  useEffect(() => {
    setVisible(true);
    if (patient) {
       setAiSummary(patient.aiSummary || "");
       setClinicalFrame(patient.clinicalFrame || "");
    }
  }, [patient]);

  if (!patient) return null;

  const doc = patient.documents || patient.pastRecords;
  const { ayush, vitals } = patient;

  const getTakingDuration = () => {
    if (doc?.takingDurationText) return doc.takingDurationText;
    if (patient.takingDurationText) return patient.takingDurationText;
    const dStr = doc?.prescriptionDate || doc?.documentDate || doc?.date;
    if (!dStr) return null;
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return null;
    const diffDays = Math.max(0, Math.floor((new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
    if (diffDays === 0) return "Patient started taking this medicine today";
    if (diffDays === 1) return "Patient is taking this medicine for 1 day";
    if (diffDays < 30) return `Patient is taking this medicine for ${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    const remDays = diffDays % 30;
    return remDays === 0 
      ? `Patient is taking this medicine for ${months} month${months > 1 ? 's' : ''}`
      : `Patient is taking this medicine for ${months} month${months > 1 ? 's' : ''} and ${remDays} day(s) (${diffDays} days total)`;
  };
  const durationBanner = getTakingDuration();
  const rxDateDisplay = doc?.prescriptionDate || doc?.documentDate || doc?.date || 'Recent';

  return (
    <div className="psm-backdrop" onClick={onClose}>
      <div className={`psm-dialog ${visible ? 'psm-visible' : ''}`} onClick={e => e.stopPropagation()}>
        
        {/* Top Sticky Bar */}
        <div className="psm-top-bar">
          <div className="psm-top-title">
            <HeartPulse size={18} color="#0E7C66" />
            <span>AI Clinical Patient Summary</span>
          </div>
          <button className="psm-close-btn" onClick={onClose} title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="psm-content">
          {/* Header Block */}
          <div className="ps-header">
            <div className="ps-header-left">
              <h2 className="ps-patient-name">{patient.name}</h2>
              <div className="ps-abha-row">
                <CheckCircle2 size={13} color="#0E7C66" strokeWidth={2.5} />
                <span className="ps-abha-id">{patient.abhaId}</span>
                <span className="ps-verified">ABHA Verified</span>
              </div>
              <div className="ps-meta-row">
                <span>{patient.age} yrs · {patient.gender}</span>
                <span className="ps-meta-dot">·</span>
                <span>Check-in: <span className="ps-time">{patient.checkInTime}</span></span>
                {patient.tokenNumber && (
                  <>
                    <span className="ps-meta-dot">·</span>
                    <span style={{ background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px' }}>Token: {patient.tokenNumber}</span>
                  </>
                )}
              </div>
            </div>
            {patient.flagged && (
              <div className="ps-flag-chip">
                ⚠ Emergency Priority Alert
              </div>
            )}
          </div>

          {/* Vitals Ribbon */}
          {vitals && (
            <div className="ps-vitals-ribbon">
              <div className="ps-v-item">
                <span className="ps-v-lbl">Blood Pressure</span>
                <span className="ps-v-val">{vitals.bp}</span>
              </div>
              <div className="ps-v-item">
                <span className="ps-v-lbl">Heart Rate</span>
                <span className="ps-v-val">{vitals.hr}</span>
              </div>
              <div className="ps-v-item">
                <span className="ps-v-lbl">SpO2 Level</span>
                <span className="ps-v-val">{vitals.spo2}</span>
              </div>
              <div className="ps-v-item">
                <span className="ps-v-lbl">Temp</span>
                <span className="ps-v-val">{vitals.temp}</span>
              </div>
            </div>
          )}

          {/* AI Clinical Summary Card */}
          <div className="ps-card ps-ai-card">
            <div className="ps-ai-header">
              <div className="ps-ai-title-row">
                <Sparkles size={16} color="#0E7C66" strokeWidth={2} />
                <span className="ps-ai-title">10-Second Clinical Summary</span>
                <span className="ps-ai-pill">AI-assisted · Doctor review required</span>
              </div>
              <div className="ps-confidence">
                <span className="ps-conf-val">{patient.aiConfidence}%</span>
                <span className="ps-conf-label">Confidence</span>
              </div>
            </div>
            <p className="ps-ai-text">{patient.aiSummary}</p>
          </div>

          {/* Chief Complaint & Assessment */}
          <div className="ps-card ps-cc-card">
            <div className="ps-card-label">Chief Complaint & Voice Input</div>
            <div className="ps-quote-block">
              <span className="ps-quote-mark">"</span>
              <p className="ps-patient-words">{patient.patientWords?.replace(/^"|"$/g, '')}</p>
            </div>
            <div className="ps-clinical-frame">
              <span className="ps-frame-label">AI Clinical Assessment & Plan</span>
              {isEditing ? (
                 <textarea 
                    className="ps-edit-textarea" 
                    value={clinicalFrame} 
                    onChange={(e) => setClinicalFrame(e.target.value)} 
                    rows={3}
                 />
              ) : (
                 <p className="ps-frame-text">{clinicalFrame}</p>
              )}
            </div>
          </div>

          {/* Extracted Prescriptions */}
          {doc && (
            <div className="ps-card">
              <div className="ps-card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Extracted Prescription & Medications</span>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#0E7C66', textTransform: 'none' }}>
                  Gemini Vision 2.0 Digitized
                </span>
              </div>

              {durationBanner && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '9px 14px', margin: '10px 0 14px 0', fontSize: '0.84rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#16a34a" />
                  <span>⏱️ {durationBanner}</span>
                </div>
              )}

              <div className="ps-doc-meta-row">
                <div className="ps-doc-field">
                  <span className="ps-field-label">Prescribing Doctor</span>
                  <span className="ps-field-val">{doc.prescribingDoctor || doc.doctor || 'Attending Physician'}</span>
                </div>
                <div className="ps-doc-field">
                  <span className="ps-field-label">Document Type</span>
                  <span className="ps-field-val">{doc.documentType || doc.type || 'Prescription'}</span>
                </div>
                <div className="ps-doc-field">
                  <span className="ps-field-label">Prescription Date</span>
                  <span className="ps-field-val ps-mono" style={{ color: '#0e7c66', fontWeight: 600 }}>{rxDateDisplay}</span>
                </div>
              </div>

              <div className="ps-med-table">
                <div className="ps-med-thead">
                  <span>Medicine</span>
                  <span>Dosage</span>
                  <span>Frequency</span>
                  <span>Duration</span>
                </div>
                {doc.medicines?.map((m, i) => (
                  <div key={i} className={`ps-med-row ${i % 2 === 1 ? 'alt' : ''}`}>
                    <span className="ps-med-name">
                      {m.name}
                      {m.timing && <small style={{ display: 'block', color: '#64748b', fontSize: '0.72rem', fontWeight: 400 }}>{m.timing}</small>}
                    </span>
                    <span className="ps-mono">{m.dosage}</span>
                    <span>{m.frequency}</span>
                    <span className="ps-mono">{m.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AYUSH Parameters */}
          {ayush && (
            <div className="ps-card ps-ayush-card">
              <div className="ps-ayush-header">
                <Leaf size={15} color="#5A9367" strokeWidth={2} />
                <span className="ps-ayush-title">AYUSH Parameters & Dosha Assessment</span>
              </div>

              <div className="ps-ayush-section">
                <div className="ps-ayush-row-label">Prakriti <span>(Physical Constitution)</span></div>
                <AyushBar {...ayush.prakriti} />
              </div>

              <div className="ps-ayush-section">
                <div className="ps-ayush-row-label">Vikriti <span>(Current Imbalance State)</span></div>
                <AyushBar {...ayush.vikriti} />
              </div>

              <p className="ps-ayush-caption">MediKiosk Integrated AYUSH Clinical Module</p>
            </div>
          )}

          {/* Action Row */}
          <div className="ps-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isEditing ? (
               <button className="ps-btn-primary" onClick={() => setIsEditing(false)}>
                 <Check size={15} strokeWidth={2.5} /> Save Notes
               </button>
            ) : (
               <button className="ps-btn-outline" onClick={() => setIsEditing(true)}>
                 <ClipboardEdit size={15} strokeWidth={2} /> Edit Chart Notes
               </button>
            )}
            <button className="ps-btn-primary" onClick={onClose} style={{ marginLeft: isEditing ? '0' : 'auto' }}>
              <CheckCircle2 size={15} strokeWidth={2.5} /> Finalize Chart & Start Consultation
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientSummaryModal;
