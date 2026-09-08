import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, Search, Download, Eye, Pill } from 'lucide-react';
import './DocumentsView.css';

const DocumentsView = ({ patients, onSelectPatient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const docList = patients.map(p => ({
    patientId: p.id,
    patientName: p.name,
    abhaId: p.abhaId,
    docType: p.documents?.documentType || 'OPD Prescription',
    prescribingDoctor: p.documents?.prescribingDoctor || 'Dr. P. K. Singh',
    date: p.documents?.documentDate || '01/09/2026',
    medicines: p.documents?.medicines || [],
    ocrConfidence: p.aiConfidence,
    rawPatient: p
  }));

  const filteredDocs = docList.filter(d => {
    const matchesSearch =
      d.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.abhaId.includes(searchTerm) ||
      d.prescribingDoctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'All' || d.docType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="dv-root">
      <div className="dv-header">
        <div>
          <h1 className="dv-title">Prescriptions & Documents Vault</h1>
          <p className="dv-subtitle">AI OCR extracted prescriptions, OPD notes, and lab reports</p>
        </div>
        <div className="dv-badge">
          <FileText size={16} color="#0E7C66" />
          <span>{filteredDocs.length} Parsed Prescriptions</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="dv-toolbar">
        <div className="dv-search-box">
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by Doctor, Patient or ABHA ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="dv-type-pills">
          {['All', 'OPD Prescription', 'Emergency Referral Note', 'OPD Follow-up Note'].map(t => (
            <button
              key={t}
              className={`dv-pill ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Cards */}
      <div className="dv-grid">
        {filteredDocs.map((doc, idx) => (
          <div key={idx} className="dv-card">
            <div className="dv-card-top">
              <span className="dv-type-badge">{doc.docType}</span>
              <span className="dv-date-mono">{doc.date}</span>
            </div>

            <div className="dv-patient-info">
              <h3 className="dv-patient-name">{doc.patientName}</h3>
              <div className="dv-abha-row">
                <CheckCircle2 size={12} color="#0E7C66" />
                <span className="dv-mono">{doc.abhaId}</span>
              </div>
            </div>

            <div className="dv-doctor-info">
              <span className="dv-lbl">Prescribing Doctor:</span>
              <span className="dv-doctor-name">{doc.prescribingDoctor}</span>
            </div>

            {/* Medicines List */}
            <div className="dv-meds-box">
              <div className="dv-meds-title">
                <Pill size={13} color="#0E7C66" />
                <span>Extracted Medicines ({doc.medicines.length})</span>
              </div>
              <div className="dv-meds-list">
                {doc.medicines.map((m, i) => (
                  <div key={i} className="dv-med-chip">
                    <span className="dv-med-name">{m.name}</span>
                    <span className="dv-med-dos">{m.dosage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="dv-card-footer">
              <div className="dv-ocr-score">
                <Sparkles size={13} color="#0E7C66" />
                <span>{doc.ocrConfidence}% OCR Accuracy</span>
              </div>

              <div className="dv-actions">
                <button
                  className="dv-btn-view"
                  onClick={() => onSelectPatient(doc.rawPatient)}
                >
                  <Eye size={14} />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsView;
