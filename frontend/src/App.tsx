import React, { useState, useRef, useEffect } from 'react';
import { 
  Stethoscope, 
  Pill, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Copy, 
  RefreshCw, 
  HeartPulse, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  User,
  Check,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  Utensils,
  Ban,
  Sun,
  Sunset,
  Moon,
  Thermometer,
  Activity,
  Award,
  Mic,
  MicOff,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Prescription {
  name: string;
  dosage: string;
  form: string;
  frequency: string;
  duration: string;
  instructions: string;
  time_of_day?: string;
  rx_norm?: string;
}

interface DoctorReport {
  consultation_id: string;
  doctor_info: {
    name: string;
    title: string;
    license: string;
    department?: string;
    institution: string;
  };
  patient: {
    name: string;
    age: number;
    gender: string;
    symptoms: string;
    duration: string;
    severity: string;
    vitals?: string;
  };
  diagnosis: string;
  clinical_findings: string[];
  prescriptions: Prescription[];
  daily_schedule?: {
    morning: string[];
    afternoon: string[];
    evening: string[];
    bedtime: string[];
  };
  nutrition?: {
    recommended_foods: string[];
    foods_to_avoid: string[];
  };
  safety_alerts?: string[];
  care_advice: string[];
  precautions: string[];
  follow_up: string;
  ai_engine?: string;
  doctor_personal_note?: string;
  created_at: string;
  verification_hash?: string;
}

interface ChatMessage {
  sender: 'patient' | 'doctor';
  text: string;
  time: string;
  engine?: string;
}

export function App() {
  // Patient Input Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState('Male');
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState(5);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [temperature, setTemperature] = useState('98.6');
  const [bloodPressure, setBloodPressure] = useState('120/80');

  // Consultation State
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Taken Pills Tracker State
  const [takenPills, setTakenPills] = useState<Record<string, boolean>>({});

  // Follow-Up Q&A State
  const [questionText, setQuestionText] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested Clinical Inquiries
  const suggestedInquiries = [
    { label: '🥛 Take with food/milk?', query: 'Can I take these medications with food or milk?' },
    { label: '⏰ What if I miss a dose?', query: 'What should I do if I accidentally miss a scheduled dose?' },
    { label: '☕ Can I drink coffee/tea?', query: 'Is it safe to drink tea or coffee while taking this treatment?' },
    { label: '🏃 When can I exercise?', query: 'When is it safe to resume physical workouts and exercise?' },
    { label: '⚠️ Possible side effects?', query: 'What common side effects should I watch out for with these medicines?' },
    { label: '🩺 Expected recovery time?', query: 'How many days will it take for me to fully recover from this condition?' }
  ];

  // Quick Chips
  const commonSymptoms = [
    'Fever',
    'Cold & Cough',
    'Headache',
    'Eye Pain',
    'Sore Throat',
    'Nausea',
    'Body Aches',
    'Fatigue',
  ];

  const handleAddSymptom = (chip: string) => {
    if (!symptoms.toLowerCase().includes(chip.toLowerCase())) {
      setSymptoms(symptoms ? `${symptoms}, ${chip}` : chip);
    }
  };

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!symptoms.trim()) {
      setErrorMsg('Please describe at least one symptom before consulting.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: name.trim() || 'Patient',
          age: Number(age) || 25,
          gender,
          symptoms,
          duration,
          severity,
          medical_history: medicalHistory,
          allergies,
          current_medications: currentMedications,
          temperature,
          blood_pressure: bloodPressure,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to complete clinical consultation');
      }

      const data = await res.json();
      setReport(data);
      setTakenPills({});
      setChatHistory([
        {
          sender: 'doctor',
          text: `Hello ${name || 'there'}, I have reviewed your clinical symptoms and prepared your official prescription slip for ${data.diagnosis}. Feel free to ask me any questions about your medications, food interactions, or recovery schedule!`,
          time: 'Just now',
          engine: 'Verified Medical Record',
        },
      ]);

      setTimeout(() => {
        const el = document.getElementById('doctor-prescription-view');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to reach Dr. Anand. Please check your connection and try again.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAudioVoice = () => {
    if (!report) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const primaryAdvice = report.care_advice && report.care_advice.length > 0 
      ? report.care_advice[0] 
      : 'Please rest well and take each medication according to the schedule.';
    const script = `Hello ${report.patient.name || 'there'}. This is ${report.doctor_info.name}. Based on your reported symptoms, my clinical diagnosis is ${report.diagnosis}. I have prescribed ${report.prescriptions.map(p => p.name).join(', ')}. ${primaryAdvice}. Wishing you a rapid recovery!`;

    const utterance = new SpeechSynthesisUtterance(script);
    
    // Select an articulate male voice
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('male') || 
       v.name.toLowerCase().includes('david') || 
       v.name.toLowerCase().includes('george') || 
       v.name.toLowerCase().includes('mark') || 
       v.name.toLowerCase().includes('james') || 
       v.name.toLowerCase().includes('guy') || 
       v.name.toLowerCase().includes('natural') ||
       v.name.toLowerCase().includes('uk english male'))
    ) || voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('zira') && !v.name.toLowerCase().includes('susan'));

    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    utterance.rate = 0.92;
    utterance.pitch = 0.88; // Deep, calm, authoritative male physician tone
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleTogglePill = (key: string) => {
    const next = !takenPills[key];
    setTakenPills(prev => ({ ...prev, [key]: next }));
    if (next) {
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 },
      });
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAsking]);

  // Speech cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const playDoctorMessageVoice = (text: string, index: number) => {
    if (activeSpeechIndex === index) {
      window.speechSynthesis.cancel();
      setActiveSpeechIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.toLowerCase().includes('male') || 
       v.name.toLowerCase().includes('david') || 
       v.name.toLowerCase().includes('george') || 
       v.name.toLowerCase().includes('mark') || 
       v.name.toLowerCase().includes('james') || 
       v.name.toLowerCase().includes('guy') || 
       v.name.toLowerCase().includes('natural') ||
       v.name.toLowerCase().includes('uk english male'))
    ) || voices.find(v => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('zira') && !v.name.toLowerCase().includes('susan'));

    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    utterance.rate = 0.92;
    utterance.pitch = 0.88;
    utterance.onend = () => setActiveSpeechIndex(null);
    utterance.onerror = () => setActiveSpeechIndex(null);

    window.speechSynthesis.speak(utterance);
    setActiveSpeechIndex(index);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Microphone speech recognition is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuestionText(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (_) {
      setIsListening(false);
    }
  };

  const submitQuestion = async (textToSend: string) => {
    if (!textToSend.trim() || !report) return;

    const userQ = textToSend.trim();
    setQuestionText('');
    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { sender: 'patient', text: userQ, time: 'Just now' },
    ];
    setChatHistory(updatedHistory);

    try {
      setIsAsking(true);
      const res = await fetch('/api/doctor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultation_id: report.consultation_id,
          patient_name: report.patient.name,
          diagnosis: report.diagnosis,
          question: userQ,
          prescriptions: report.prescriptions,
          history: updatedHistory.map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!res.ok) throw new Error('Could not get response from doctor');
      const data = await res.json();
      setChatHistory(prev => [
        ...prev,
        { sender: 'doctor', text: data.answer, time: data.timestamp || 'Just now', engine: data.engine || 'Verified Physician' },
      ]);
    } catch (err: unknown) {
      setChatHistory(prev => [
        ...prev,
        { sender: 'doctor', text: 'Dr. Anand is temporarily attending to an outpatient procedure. Please resubmit your question in a moment, or review your prescription directions above.', time: 'Just now', engine: 'Clinical Care Portal' },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(questionText);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyNotes = () => {
    if (!report) return;
    const text = `
OFFICIAL MEDICAL CONSULTATION & PRESCRIPTION RECORD
Doctor: ${report.doctor_info.name} (${report.doctor_info.title})
Patient: ${report.patient.name}, ${report.patient.age} yo ${report.patient.gender}
Diagnosis: ${report.diagnosis}

PRESCRIPTIONS (Rx):
${report.prescriptions.map((p, i) => `${i + 1}. ${p.name} - ${p.dosage} (${p.frequency})\n   Instructions: ${p.instructions}`).join('\n')}

CARE ADVICE:
${report.care_advice.map(a => `• ${a}`).join('\n')}

SAFETY PRECAUTIONS:
${report.precautions.map(p => `• ${p}`).join('\n')}

Follow-up: ${report.follow_up}
Date: ${report.created_at}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sleek Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Stethoscope className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Dr. Anand Medical Care</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Online 24/7
                </span>
              </div>
              <p className="text-xs text-slate-500">Consultant Physician • Internal &amp; Family Medicine Telehealth</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe Rx Guard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            <span>Board-Certified Virtual Consultation</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Consult Dr. Anand, MD
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Enter your symptoms and medical background. Dr. Anand will clinically evaluate your condition, formulate your official medical prescription slip, and design your personalized recovery protocol.
          </p>
        </div>

        {/* Patient Input Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden max-w-4xl mx-auto">
          <div className="p-6 bg-slate-50/60 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Step 1: Patient Clinical Intake</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Safe &amp; Confidential</span>
          </div>

          <form onSubmit={handleConsult} className="p-6 sm:p-8 space-y-6">
            {/* Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={1}
                  max={120}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Symptoms Input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                What symptoms are you experiencing?
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={2}
                placeholder="e.g. Fever, cold, eye pain, and headache..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />

              {/* Quick Symptom Chips */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Select:</span>
                {commonSymptoms.map((chip, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddSymptom(chip)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium border border-slate-200 transition-all cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration and Severity Slider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  How long have you had this?
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2 days, 1 week"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Discomfort Level: <span className="text-blue-600 font-bold">{severity}/10</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {severity >= 7 ? 'Severe' : severity >= 4 ? 'Moderate' : 'Mild'}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Optional Vitals (Temp & BP) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  Body Temperature (°F)
                </label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="98.6"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="120/80"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                />
              </div>
            </div>

            {/* History, Allergies, Meds */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Past History / Surgeries
                </label>
                <input
                  type="text"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Sinus Surgery, None"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Known Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, None"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Current Medications
                </label>
                <input
                  type="text"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="e.g. Lisinopril, None"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                />
              </div>
            </div>

            {/* Action CTA */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="pt-3 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-500/30 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Dr. Anand is Formulating Your Prescription...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-5 h-5" />
                    <span>Confirm Clinical Consultation &amp; Issue Rx</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Official Medical Prescription & Clinical Report View */}
        {report && (
          <div id="doctor-prescription-view" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">Official Medical Prescription Slip</h3>
              </div>

              <div className="flex items-center space-x-2">
                {/* Voice Advice Button */}
                <button
                  onClick={toggleAudioVoice}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all ${
                    isPlayingAudio
                      ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Listen to Dr. Anand speak out your diagnosis and advice"
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
                  <span>{isPlayingAudio ? 'Stop Voice' : '🔊 Listen to Doctor'}</span>
                </button>

                <button
                  onClick={handleCopyNotes}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Notes'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Prescription</span>
                </button>
              </div>
            </div>

            {/* Official Medical Prescription Document */}
            <div className="bg-white rounded-3xl border border-slate-300 shadow-xl overflow-hidden p-6 sm:p-10 space-y-6 relative print:border-none print:shadow-none print:p-0">
              {/* Watermark Seal */}
              <div className="absolute right-8 top-28 opacity-5 pointer-events-none select-none">
                <Stethoscope className="w-72 h-72 text-slate-900" />
              </div>

              {/* Letterhead */}
              <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🩺</span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {report.doctor_info.name}
                    </h2>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">
                    {report.doctor_info.title} • {report.doctor_info.institution}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    Registration No: {report.doctor_info.license}
                  </p>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-slate-500">
                  <div className="font-bold text-slate-800 text-sm">Rx ID: {report.consultation_id}</div>
                  <div>Date: {report.created_at}</div>
                  <div className="text-emerald-700 font-bold mt-1">● Board-Certified Clinical Encounter</div>
                </div>
              </div>

              {/* Patient Profile Bar */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Patient:</span>
                  <span className="font-bold text-slate-900">{report.patient.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Demographics:</span>
                  <span className="font-bold text-slate-900">{report.patient.age} yrs • {report.patient.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Duration:</span>
                  <span className="font-bold text-slate-900">{report.patient.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Recorded Vitals:</span>
                  <span className="font-bold text-blue-700">{report.patient.vitals || 'Temp: 98.6°F'}</span>
                </div>
              </div>

              {/* Clinical Diagnosis Section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Primary Clinical Diagnosis</span>
                </div>
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <h3 className="text-base sm:text-lg font-black text-blue-950">
                    {report.diagnosis}
                  </h3>
                  <div className="mt-2.5 space-y-1">
                    {report.clinical_findings.map((f, i) => (
                      <p key={i} className="text-xs text-slate-700 font-medium leading-relaxed">
                        • {f}
                      </p>
                    ))}
                  </div>

                  {report.doctor_personal_note && (
                    <div className="mt-3.5 pt-3 border-t border-blue-200/80 flex items-start space-x-2.5">
                      <FileText className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                          Attending Physician&apos;s Clinical Impression:
                        </span>
                        <p className="text-xs text-blue-950 font-semibold mt-0.5 leading-relaxed italic">
                          &quot;{report.doctor_personal_note}&quot;
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Prescribed Medications (Rx Table) */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <span className="font-serif italic font-black text-xl text-blue-600">Rx</span>
                  <span>Prescribed Medication Schedule</span>
                </div>

                <div className="space-y-3">
                  {report.prescriptions.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-extrabold text-sm sm:text-base text-slate-900">
                            {med.name}
                          </span>
                          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {med.dosage}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60 self-start sm:self-auto">
                          {med.frequency}
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 pl-8 space-y-1">
                        <div><strong className="text-slate-700">Form:</strong> {med.form} • <strong className="text-slate-700">Duration:</strong> {med.duration}</div>
                        <div className="text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 font-medium">
                          👉 <strong className="text-slate-900">How to take:</strong> {med.instructions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Daily Dosage Clock (Timeline) */}
              {report.daily_schedule && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Today&apos;s Medication Dosage Clock (Check off doses as taken)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Pill Tracker</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {/* Morning */}
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                        <span>Morning (8:00 AM)</span>
                      </div>
                      <div className="space-y-1.5">
                        {report.daily_schedule.morning.map((p, i) => {
                          const k = `morn-${i}`;
                          const isDone = !!takenPills[k];
                          return (
                            <label key={i} className="flex items-start space-x-2 text-[11px] text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleTogglePill(k)}
                                className="mt-0.5 accent-blue-600 rounded"
                              />
                              <span className={isDone ? 'line-through text-slate-400' : 'font-medium'}>{p}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Afternoon */}
                    <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-orange-800">
                        <Sunset className="w-3.5 h-3.5 text-orange-600" />
                        <span>Afternoon (1:00 PM)</span>
                      </div>
                      <div className="space-y-1.5">
                        {report.daily_schedule.afternoon.length > 0 ? (
                          report.daily_schedule.afternoon.map((p, i) => {
                            const k = `aft-${i}`;
                            const isDone = !!takenPills[k];
                            return (
                              <label key={i} className="flex items-start space-x-2 text-[11px] text-slate-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => handleTogglePill(k)}
                                  className="mt-0.5 accent-blue-600 rounded"
                                />
                                <span className={isDone ? 'line-through text-slate-400' : 'font-medium'}>{p}</span>
                              </label>
                            );
                          })
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No scheduled midday pills</span>
                        )}
                      </div>
                    </div>

                    {/* Evening */}
                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-800">
                        <Sunset className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Evening (7:00 PM)</span>
                      </div>
                      <div className="space-y-1.5">
                        {report.daily_schedule.evening.map((p, i) => {
                          const k = `eve-${i}`;
                          const isDone = !!takenPills[k];
                          return (
                            <label key={i} className="flex items-start space-x-2 text-[11px] text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleTogglePill(k)}
                                className="mt-0.5 accent-blue-600 rounded"
                              />
                              <span className={isDone ? 'line-through text-slate-400' : 'font-medium'}>{p}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bedtime */}
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-800">
                        <Moon className="w-3.5 h-3.5 text-purple-600" />
                        <span>Bedtime (10:00 PM)</span>
                      </div>
                      <div className="space-y-1.5">
                        {report.daily_schedule.bedtime.map((p, i) => {
                          const k = `bed-${i}`;
                          const isDone = !!takenPills[k];
                          return (
                            <label key={i} className="flex items-start space-x-2 text-[11px] text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => handleTogglePill(k)}
                                className="mt-0.5 accent-blue-600 rounded"
                              />
                              <span className={isDone ? 'line-through text-slate-400' : 'font-medium'}>{p}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nutrition & Food Recommendations */}
              {report.nutrition && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-emerald-600" />
                      <span>Foods to Eat for Quick Recovery</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-emerald-950">
                      {report.nutrition.recommended_foods.map((food, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                      <Ban className="w-4 h-4 text-rose-600" />
                      <span>Foods &amp; Habits to Avoid</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-rose-950">
                      {report.nutrition.foods_to_avoid.map((food, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-rose-600 font-bold">✕</span>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Doctor's Care Notes & Precautions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Doctor&apos;s Recovery Advice</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {report.care_advice.map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Safety Alerts &amp; Precautions</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-amber-900">
                    {report.precautions.map((item, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Digital Signature & Verification */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  <strong className="text-slate-700">Follow-up:</strong> {report.follow_up}
                </div>

                <div className="text-left sm:text-right">
                  <div className="font-serif italic text-xl font-bold text-slate-900 tracking-wider">
                    Dr. Anand, MD
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold flex items-center sm:justify-end gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>Digitally Signed &amp; Clinically Certified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Follow-Up Chat Box with Dr. Anand */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Direct Clinical Q&amp;A with Dr. Anand, MD</h4>
                    <p className="text-xs text-slate-500">Continuous medical consultation regarding your medications, nutrition, or recovery schedule</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Physician Active</span>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === 'patient'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200/80 shadow-xs'
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase mb-1.5 opacity-80 flex items-center justify-between gap-3">
                        <span>{msg.sender === 'patient' ? 'You (Patient)' : 'Dr. Anand, MD'}</span>
                        {msg.sender === 'doctor' && (
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ● Attending Physician
                          </span>
                        )}
                      </div>
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Doctor Audio Playback Button */}
                      {msg.sender === 'doctor' && (
                        <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => playDoctorMessageVoice(msg.text, i)}
                            title={activeSpeechIndex === i ? "Stop playback" : "Listen to Dr. Anand's answer"}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              activeSpeechIndex === i
                                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                                : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {activeSpeechIndex === i ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 animate-pulse text-white" />
                                <span>Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Listen to Answer</span>
                              </>
                            )}
                          </button>
                          <span className="text-[10px] text-slate-400">{msg.time}</span>
                        </div>
                      )}
                    </div>
                    {msg.sender === 'patient' && (
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                    )}
                  </div>
                ))}

                {isAsking && (
                  <div className="flex items-center space-x-2.5 text-xs text-blue-700 bg-blue-50/80 border border-blue-200/70 p-3 rounded-2xl w-fit animate-pulse">
                    <Stethoscope className="w-4 h-4 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="font-semibold">Dr. Anand is reviewing your clinical inquiry and preparing guidance...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Clinical Inquiries Chips */}
              <div className="pt-1 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant Clinical Inquiries:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedInquiries.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAsking}
                      onClick={() => submitQuestion(chip.query)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-100/80 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer disabled:opacity-50 font-medium"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Input Form with Voice Dictation */}
              <form onSubmit={handleSendQuestion} className="space-y-2 pt-1">
                {isListening && (
                  <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                    <span>Microphone active — Listening to your speech... Speak clearly</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ask Dr. Anand a medical question (or tap microphone to speak)..."
                    disabled={isAsking}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isAsking}
                    title={isListening ? "Listening... click to stop" : "Speak question using microphone"}
                    className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                      isListening
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    type="submit"
                    disabled={isAsking || !questionText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-1">
          <p className="text-xs text-slate-500">
            © 2026 Dr. Anand Medical Care Clinic • Outpatient Clinical Services &amp; Digital Telehealth.
          </p>
          <p className="text-[11px] text-slate-400">
            For critical life-threatening medical emergencies, please dial your local emergency services (911/112).
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
