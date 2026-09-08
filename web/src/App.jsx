import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import PatientKiosk from './components/PatientKiosk';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import DashboardOverview from './components/DashboardOverview';
import PatientsView from './components/PatientsView';
import TriageDashboard from './components/TriageDashboard';
import CasesView from './components/CasesView';
import DocumentsView from './components/DocumentsView';
import ConsultationsView from './components/ConsultationsView';
import SettingsView from './components/SettingsView';
import PatientSummaryModal from './components/PatientSummary';
import NewPatientModal from './components/NewPatientModal';
import { INITIAL_PATIENTS } from './data/patientsData';
import './App.css';

const KioskWrapper = () => {
  const navigate = useNavigate();
  return <PatientKiosk onExit={() => navigate('/')} />;
};

const DashboardLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  const handleAddPatient = (newPatient) => {
    setPatients([newPatient, ...patients]);
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Right Content View Area */}
      <div className="dash-main-content">
        {/* Top Header Bar */}
        <TopNavbar />

        {/* Dynamic View based on Active Sidebar Tab */}
        <main className="dash-body">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              patients={patients}
              onSelectPatient={setSelectedPatient}
              onNewPatient={() => setShowNewPatientModal(true)}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsView
              patients={patients}
              onSelectPatient={setSelectedPatient}
            />
          )}

          {activeTab === 'queue' && (
            <TriageDashboard
              patients={patients}
              onSelectPatient={setSelectedPatient}
              selectedPatientId={selectedPatient?.id}
            />
          )}

          {activeTab === 'cases' && (
            <CasesView
              patients={patients}
              onSelectPatient={setSelectedPatient}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              patients={patients}
              onSelectPatient={setSelectedPatient}
            />
          )}

          {activeTab === 'consultations' && (
            <ConsultationsView
              patients={patients}
              onSelectPatient={setSelectedPatient}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Fancy Popup Modal for Selected Patient */}
      {selectedPatient && (
        <PatientSummaryModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* New Patient Intake Modal */}
      {showNewPatientModal && (
        <NewPatientModal
          onClose={() => setShowNewPatientModal(false)}
          onAddPatient={handleAddPatient}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/kiosk" element={<KioskWrapper />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
