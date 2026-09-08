export const mockPatients = [
  {
    id: "PT-001",
    name: "Ramesh Kumar",
    age: 45,
    gender: "Male",
    abhaId: "91-4521-8890-3342",
    priority: "high",
    chiefComplaint: "Severe chest pain radiating to left arm, sweating",
    vitals: {
      bp: "160/100",
      heartRate: 110,
      temp: "98.6°F",
      spO2: "94%"
    },
    ayush: {
      prakriti: "Vata-Pitta",
      vikriti: "Vata aggravation",
      agni: "Vishamagni"
    },
    medicines: [
      { name: "Aspirin", dosage: "75mg", freq: "1-0-0" },
      { name: "Atorvastatin", dosage: "20mg", freq: "0-0-1" }
    ],
    timeline: [
      { date: "2023-10-12", title: "Prescription Scanned", desc: "Dr. Sharma (Cardiology)" },
      { date: "2023-10-15", title: "ECG Report Uploaded", desc: "Shows ST elevation" }
    ]
  },
  {
    id: "PT-002",
    name: "Sunita Devi",
    age: 32,
    gender: "Female",
    abhaId: "91-2234-5561-8890",
    priority: "normal",
    chiefComplaint: "Chronic joint pain and morning stiffness for 3 months",
    vitals: {
      bp: "120/80",
      heartRate: 72,
      temp: "98.4°F",
      spO2: "98%"
    },
    ayush: {
      prakriti: "Kapha",
      vikriti: "Kapha-Vata aggravation",
      agni: "Mandagni"
    },
    medicines: [
      { name: "Ibuprofen", dosage: "400mg", freq: "1-0-1" },
      { name: "Ashwagandha Churna", dosage: "5g", freq: "1-0-1 (with milk)" }
    ],
    timeline: [
      { date: "2023-08-01", title: "Initial Visit", desc: "Orthopedics OPD" },
      { date: "2023-08-10", title: "Blood Report", desc: "RA Factor Positive" },
      { date: "2023-09-15", title: "Follow-up Prescription", desc: "Added Ayurvedic supplements" }
    ]
  },
  {
    id: "PT-003",
    name: "Amit Patel",
    age: 28,
    gender: "Male",
    abhaId: "91-7781-2290-1122",
    priority: "normal",
    chiefComplaint: "Fever, cough, and generalized weakness for 4 days",
    vitals: {
      bp: "110/70",
      heartRate: 90,
      temp: "101.2°F",
      spO2: "97%"
    },
    ayush: {
      prakriti: "Pitta",
      vikriti: "Pitta aggravation",
      agni: "Tikshnagni"
    },
    medicines: [
      { name: "Paracetamol", dosage: "500mg", freq: "1-1-1" },
      { name: "Azithromycin", dosage: "500mg", freq: "1-0-0" }
    ],
    timeline: [
      { date: "2023-10-20", title: "Prescription Scanned", desc: "General Medicine" }
    ]
  }
];
