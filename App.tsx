import React, { useState, useRef, useCallback, useEffect } from 'react';
// NEW: Professional Export Libraries
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { AuditTable } from './components/AuditTable';
import { Auditor } from './components/Auditor';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { SampleReport } from './components/SampleReport';
import { RequestAccessModal } from './components/RequestAccessModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuditEntry } from './types';

const LockedLedger: React.FC<{ onRequestAccess: () => void }> = ({ onRequestAccess }) => {
  const handleRequestClick = () => {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'lead_conversion_attempt');
    }
    onRequestAccess();
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-16 text-center max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-indigo-100">
        <i className="fas fa-lock text-4xl"></i>
      </div>
      <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Access Restricted</h3>
      <p className="text-slate-500 mb-10 leading-relaxed font-medium text-lg">
        The Detailed Ledger contains granular extraction data and proprietary AI audit trails. 
        Please initialize an auditor identity to unlock the full verification suite.
      </p>
      <button 
        onClick={handleRequestClick}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto"
      >
        <i className="fas fa-user-plus"></i>
        Sign Up to Unlock Ledger
      </button>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { user, loading, signOut, persistAuditResults } = useAuth();
  const [appView, setAppView] = useState<'landing' | 'auth' | 'internal' | 'sample'>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isSampleView, setIsSampleView] = useState(false);
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'table' | 'auditor'>('dashboard');
  const [auditResults, setAuditResults] = useState<AuditEntry[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePostLoginFlow = async () => {
      if (user && appView === 'auth') {
        if (auditResults.length > 0) {
          setSyncing(true);
          try {
            await persistAuditResults(auditResults);
            if ((window as any).gtag) {
              (window as any).gtag('event', 'guest_data_persisted', { count: auditResults.length });
            }
            setActiveTab('table'); 
          } catch (err) {
            console.error('Persistence Sequence Error:', err);
          } finally {
            setSyncing(false);
            setAppView('internal');
          }
        } else {
          setAppView('internal');
        }
      }
    };

    handlePostLoginFlow();
  }, [user, appView, auditResults, persistAuditResults]);

  const handleAuditComplete = useCallback((results: AuditEntry[]) => {
    setAuditResults(results);
    setPendingFiles(null);
    setIsAuditing(false);
    setIsSampleView(false);
    setActiveTab('dashboard');
  }, []);

  const triggerFilePicker = useCallback(() => {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'begin_audit');
    }
    setAppView('internal');
    setActiveTab('auditor');
    setAuditResults([]);
    setPendingFiles(null);
    setIsAuditing(false);
    setIsSampleView(false);
    
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
      }
    }, 100);
  }, []);

  // NEW: Professional Visual Export Function
  const handleProfessionalExport = async () => {
    // Target the Dashboard container for capture
    const element = document.getElementById('audit-dashboard-view');
    if (!element) {
        alert("Please ensure you are on the Dashboard tab to export visuals.");
        return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High DPI for audit printing
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`EXECUTIVE CARBON SUMMARY - GETCARBONPROOF AUTHENTICATED`, 10, 10);
      pdf.text(`Verified Auditor: ${user?.email || 'Guest'}`, 10, 15);
      
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save(`Executive_Carbon_Audit_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Visual Capture Failed:", err);
    }
  };

  // SURGICAL REPLACEMENT: Updated handleViewSample to bridge landing page to live dashboard engine
  const handleViewSample = useCallback(() => {
    // Professional 24.97t dataset matching image_b5a3b8.png
    const sampleData: AuditEntry[] = [
      { id: '1', category: 'Fuel', scope: 'Scope 1', usage: '1,500 L', unit: 'Diesel', co2e_kg: 4250, confidence_score: 'High', doc_type: 'Fleet Ledger' },
      { id: '2', category: 'Electricity', scope: 'Scope 2', usage: '45,000 kWh', unit: 'Grid Mix', co2e_kg: 19618, confidence_score: 'High', doc_type: 'Utility Bill' },
      { id: '3', category: 'Waste Disposal', scope: 'Scope 3', usage: '1.2 tonnes', unit: 'Landfill', co2e_kg: 1100, confidence_score: 'High', doc_type: 'Waste Cert' }
    ];

    setAuditResults(sampleData);
    setIsSampleView(true);
    setAppView('internal');
    setActiveTab('dashboard');
    
    if ((window as any).gtag) {
      (window as any).gtag('event', 'view_sample_report');
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setAuditResults([]); 
      setPendingFiles(Array.from(files));
      setIsAuditing(true);
      setIsSampleView(false);
      setActiveTab('auditor');
    }
  };

  const handleLoginNav = () => {
    setAuthMode('login');
    setAppView('auth');
  };

  const handleSignUpNav = () => {
    setAuthMode('signup');
    setAppView('auth');
  };

  const handleSignOut = async () => {
    await signOut();
    setAuditResults([]); 
    setAppView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
        <div className="w-24 h-24 border-[6px] border-emerald-500 border-t-transparent rounded-full animate-spin mb-10 shadow-2xl shadow-emerald-500/20"></div>
        <h2 className="text-2xl font-black uppercase tracking-[0.4em] mb-4">Neural Ledger Syncing</h2>
        <div className="flex flex-col items-center gap-1">
          <p className="text-slate-400 font-mono text-[10px] tracking-widest uppercase">Persistence Sequence: Active</p>
          <p className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase">Moving local activity to permanent auditor node...</p>
        </div>
      </div>
    );
  }

  if (appView === 'landing') {
    return (
      <LandingPage 
        onStart={triggerFilePicker} 
        onViewSample={handleViewSample}
        onLogin={handleLoginNav} 
        onSignUp={handleSignUpNav} 
      />
    );
  }

  if (appView === 'sample') {
    return (
      <SampleReport 
        onBack={() => setAppView('landing')} 
        onStartAudit={triggerFilePicker} 
      />
    );
  }

  if (appView === 'auth' && !user) {
    return (
      <Auth 
        initialMode={authMode} 
        hasPendingData={auditResults.length > 0}
        onBack={() => setAppView('landing')} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto relative">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lead Auditor Control Center</h1>
            <p className="text-slate-500 font-medium font-mono text-sm tracking-tighter uppercase">
              {isAuditing ? 'Status: Active Extraction' : 'Status: Node Ready'}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right mr-4 hidden md:flex md:flex-col md:justify-center">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg border ${
                user ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-slate-400 bg-slate-100 border-slate-200'
              }`}>
                {user ? 'LEAD AUDITOR NODE 3.0 ACTIVE' : 'GUEST SESSION'}
              </p>
              {user && (
                <p className="text-xs font-bold text-slate-500 mt-1">
                  {user.email}
                </p>
              )}
            </div>

            {/* SURGICAL DELETION: The "Export Charts" button has been removed to ensure professional audit integrity */}

            {user ? (
              <button 
                onClick={handleSignOut}
                className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-95 shadow-sm"
                title="Sign Out"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            ) : (
              <button 
                onClick={handleLoginNav}
                className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 font-black text-[10px] uppercase tracking-widest"
              >
                Sign In to Save
              </button>
            )}
            <button 
              onClick={triggerFilePicker}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95"
            >
              <i className="fas fa-rotate"></i>
              Audit Portfolio
            </button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <Dashboard 
            results={auditResults} 
            isProcessing={isAuditing} 
            isSample={isSampleView}
            onAuthRequired={handleSignUpNav}
            onSignInRequired={handleLoginNav}
          />
        )}
        
        {activeTab === 'table' && (
          user ? <AuditTable results={auditResults} /> : <LockedLedger onRequestAccess={() => setIsRequestAccessModalOpen(true)} />
        )}

        {activeTab === 'auditor' && (
          <Auditor 
            filesToProcess={pendingFiles}
            onComplete={handleAuditComplete} 
            isProcessing={isAuditing} 
            setIsProcessing={setIsAuditing}
            onTriggerPicker={triggerFilePicker}
          />
        )}
      </main>

      <RequestAccessModal 
        isOpen={isRequestAccessModalOpen} 
        onClose={() => setIsRequestAccessModalOpen(false)} 
      />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;