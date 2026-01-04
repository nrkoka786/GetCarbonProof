
import React, { useState } from 'react';
import { RequestAccessModal } from './RequestAccessModal';

const Logo = ({ className, textColor = '#1e293b' }: { className?: string, textColor?: string }) => (
  <svg 
    viewBox="0 0 550 100" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
    style={{ paddingRight: '10px', overflow: 'visible' }}
  >
    <path 
      d="M50 8 L18 22 Q15 24 15 28 V50 C15 75 50 92 50 92 C50 92 85 75 85 50 V28 Q85 24 82 22 L50 8 Z" 
      fill="#3730a3" 
    />
    <g>
      <path 
        d="M38 65 C28 52 36 29 64 32 C74 47 56 75 38 65 Z" 
        fill="#10b981" 
      />
      <path 
        d="M38 65 L32 73" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        opacity="0.8"
      />
    </g>
    <text 
      x="115" 
      y="68" 
      fontFamily="Inter, sans-serif" 
      fontWeight="700" 
      fontSize="52" 
      fill={textColor}
      textAnchor="start"
    >
      GetCarbonProof
    </text>
  </svg>
);

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left group"
      >
        <span className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
          <i className="fas fa-chevron-down text-xs"></i>
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-60 pb-8' : 'max-h-0'}`}>
        <p className="text-slate-600 leading-relaxed font-medium">{answer}</p>
      </div>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  darkBody?: boolean;
}

const BaseModal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, icon, children, footer, darkBody = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      <div className={`relative ${darkBody ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'} w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border`}>
        <div className="bg-[#3730a3] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <i className={`fas ${icon} text-2xl`}></i>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <h3 className="text-2xl font-black tracking-tight relative z-10">{title}</h3>
          {subtitle && <p className="text-indigo-200 text-sm font-medium mt-1 uppercase tracking-widest relative z-10">{subtitle}</p>}
        </div>
        <div className="p-8">
          {children}
          {footer && <div className={`mt-8 pt-6 border-t ${darkBody ? 'border-slate-800' : 'border-slate-100'}`}>{footer}</div>}
        </div>
      </div>
    </div>
  );
};

interface LandingPageProps {
  onStart: () => void;
  onViewSample: () => void;
  onLogin: () => void;
  onSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onViewSample, onLogin, onSignUp }) => {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isRequestAccessModalOpen, setIsRequestAccessModalOpen] = useState(false);

  const handleStartAudit = () => {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'begin_audit');
    }
    onStart();
  };

  const scrollToCapabilities = () => {
    setIsSecurityModalOpen(false);
    setTimeout(() => {
      document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <header className="w-full px-8 py-5 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo className="h-8 w-auto" textColor="#1e293b" />
        </div>
        <nav className="flex items-center gap-8">
          <button 
            onClick={() => setIsHelpModalOpen(true)}
            className="text-slate-400 hover:text-indigo-600 font-bold text-sm transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            <i className="fas fa-circle-question"></i>
            Help
          </button>
          <button 
            onClick={onLogin}
            className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors uppercase tracking-widest"
          >
            Login
          </button>
          <button 
            onClick={() => setIsRequestAccessModalOpen(true)}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-7 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all hover:scale-105 active:scale-95"
          >
            Request Access
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-12 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Lead Auditor Node 3.0 Active
          </div>
          
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Verification-Grade <br />
              <span className="text-indigo-600 text-transparent bg-clip-text bg-gradient-to-r from-[#3730a3] to-[#10b981]">Carbon Intelligence.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Verification-Grade AI for Enterprise GHG Disclosure. Instantly transform unstructured utility data into audit-ready metrics. Zero manual entry. 99.9% extraction accuracy for professional ESG reporting.
            </p>
          </div>

          <div className="pt-8 flex flex-col items-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <button 
                onClick={handleStartAudit}
                className="bg-[#3730a3] hover:bg-indigo-800 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
              >
                <i className="fas fa-microchip"></i>
                Initialize Audit Sequence
              </button>
              <button 
                onClick={onViewSample}
                className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 px-10 py-5 rounded-2xl font-black text-lg shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
              >
                <i className="fas fa-eye text-slate-400"></i>
                View Sample Report
              </button>
            </div>
            <p className="text-slate-500 text-sm mt-4 font-medium">No registration required for initial audit.</p>
          </div>
        </div>
      </section>

      {/* Compliance Trust Bar */}
      <div className="w-full bg-white border-y border-slate-100 py-6 mb-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center md:justify-around items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600">
              <i className="fas fa-check-double text-lg"></i>
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">GHG Protocol Standard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-emerald-500">
              <i className="fas fa-file-export text-lg"></i>
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Audit-Ready Output</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500">
              <i className="fas fa-bullseye text-lg"></i>
            </div>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">99.9% Extraction Accuracy</span>
          </div>
        </div>
      </div>

      {/* 3-Step Audit Path */}
      <section id="workflow" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">Workflow Architecture</h2>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">How It Works</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-8 group">
              <div className="relative">
                <div className="w-24 h-24 bg-indigo-50 text-[#3730a3] rounded-[2.5rem] flex items-center justify-center text-3xl shadow-xl group-hover:bg-[#3730a3] group-hover:text-white transition-all duration-500">
                  <i className="fas fa-file-upload"></i>
                </div>
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center font-black text-slate-900 shadow-sm">1</div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black text-slate-900">Initialize Sequence</h4>
                <p className="text-slate-500 leading-relaxed font-medium text-sm">
                  Securely upload unstructured PDFs, utility bills, or fuel ledgers. Our node encrypts data instantly on arrival.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-8 group">
              <div className="relative">
                <div className="w-24 h-24 bg-emerald-50 text-[#10b981] rounded-[2.5rem] flex items-center justify-center text-3xl shadow-xl group-hover:bg-[#10b981] group-hover:text-white transition-all duration-500">
                  <i className="fas fa-brain"></i>
                </div>
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center font-black text-slate-900 shadow-sm">2</div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black text-slate-900">AI Extraction Pulse</h4>
                <p className="text-slate-500 leading-relaxed font-medium text-sm">
                  Proprietary neural logic identifies activity metrics and calculates CO2e intensity in under 3 seconds.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-8 group">
              <div className="relative">
                <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-all duration-500">
                  <i className="fas fa-file-signature"></i>
                </div>
                <div className="absolute -top-4 -right-4 w-10 h-10 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center font-black text-slate-900 shadow-sm">3</div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xl font-black text-slate-900">Auditor Verification</h4>
                <p className="text-slate-500 leading-relaxed font-medium text-sm">
                  Review every line item in the Detailed Ledger. Download signed PDF certificates for third-party verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section id="capabilities" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4">Enterprise Engine</h2>
            <h3 className="text-4xl font-black tracking-tight">Engineered for Professional Auditors</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-slate-800/40 border border-slate-700 rounded-[2rem] hover:border-indigo-500/50 transition-all group flex gap-8 items-start">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <i className="fas fa-table-list"></i>
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold">Secure Ledger Control</h4>
                <p className="text-slate-400 leading-relaxed">Line-by-line transparency of all extracted data with direct citations to source documentation for regulatory compliance.</p>
              </div>
            </div>

            <div className="p-10 bg-slate-800/40 border border-slate-700 rounded-[2rem] hover:border-emerald-500/50 transition-all group flex gap-8 items-start">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <i className="fas fa-diagram-project"></i>
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold">Automated Scope Categorization</h4>
                <p className="text-slate-400 leading-relaxed">Neural intelligence that automatically sorts emissions into Scopes 1, 2, or 3 based on GHG Protocol definitions.</p>
              </div>
            </div>

            <div className="p-10 bg-slate-800/40 border border-slate-700 rounded-[2rem] hover:border-indigo-500/50 transition-all group flex gap-8 items-start">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-2xl group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <i className="fas fa-layer-group"></i>
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold">Multi-Document Synthesis</h4>
                <p className="text-slate-400 leading-relaxed">Process disparate files across a global portfolio into a unified, clean footprint for standardized corporate reporting.</p>
              </div>
            </div>

            <div className="p-10 bg-slate-800/40 border border-slate-700 rounded-[2rem] hover:border-emerald-500/50 transition-all group flex gap-8 items-start">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <i className="fas fa-presentation-screen"></i>
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-bold">Executive Board Reporting</h4>
                <p className="text-slate-400 leading-relaxed">High-fidelity visualization and export-ready summaries designed specifically for stakeholder and C-suite meetings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Audit Intelligence</h2>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">Professional FAQ</h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            <FAQItem 
              question="Is it GHG Protocol compliant?" 
              answer="Absolutely. Our calculation engine utilizes emission factors derived directly from the Greenhouse Gas Protocol, EPA, and UK Government conversion factors, ensuring that all output meets international disclosure standards." 
            />
            <FAQItem 
              question="How do you ensure data security?" 
              answer="Data security is our primary architecture. All uploads are processed via isolated 'Control Node' environments. We never train public models on your corporate documentation, and all session data is encrypted with enterprise-grade AES-256." 
            />
            <FAQItem 
              question="What is the extraction accuracy rate?" 
              answer="Through the use of Gemini 3 Pro-Preview multimodal extraction, we achieve a verified 99.9% accuracy rate on high-quality PDF documentation, far exceeding manual data entry reliability." 
            />
            <FAQItem 
              question="Can I customize emission factors?" 
              answer="The Lead Auditor Node currently uses global standard factors. Enterprise partners can configure custom market-based factors within their dedicated organizational environment." 
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Ready to Audit?</h3>
          <p className="text-lg text-slate-500 font-medium">Join professional auditors automating the future of carbon transparency.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleStartAudit}
              className="bg-[#3730a3] hover:bg-indigo-800 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
            >
              Start New Audit
            </button>
            <button 
              onClick={() => setIsRequestAccessModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
            >
              Request Access
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center space-y-8">
          <Logo className="h-8 w-auto opacity-40 grayscale" textColor="#1e293b" />
          <nav className="flex gap-10">
            <button 
              onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              Protocol
            </button>
            <button 
              onClick={() => setIsSecurityModalOpen(true)}
              className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              Security
            </button>
            <button 
              onClick={() => setIsPricingModalOpen(true)}
              className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              Pricing
            </button>
            <button 
              onClick={() => setIsRequestAccessModalOpen(true)}
              className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              API
            </button>
          </nav>
          <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">© 2026 GetCarbonProof Lead Auditor. Proprietary Intelligence Node.</p>
        </div>
      </footer>

      {/* Modals System */}
      <BaseModal 
        isOpen={isHelpModalOpen} 
        onClose={() => setIsHelpModalOpen(false)} 
        title="Auditor Protocol: Quick Start" 
        subtitle="Operational Onboarding Guide v3.0"
        icon="fa-book-open-reader"
        footer={<p className="text-[10px] text-center font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">For advanced technical support, contact the <span className="text-indigo-600">Lead Auditor Node admin</span></p>}
      >
        <div className="space-y-6">
          <div className="flex gap-5 group">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 text-[#3730a3] flex items-center justify-center font-black group-hover:bg-[#3730a3] group-hover:text-white transition-all">1</div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upload</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Click 'Initialize Audit Sequence' and select your utility bill or ESG report.</p>
            </div>
          </div>
          <div className="flex gap-5 group">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-[#10b981] flex items-center justify-center font-black group-hover:bg-[#10b981] group-hover:text-white transition-all">2</div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Process</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Wait 3 seconds for the AI Pulse to categorize your emissions.</p>
            </div>
          </div>
          <div className="flex gap-5 group">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 text-[#3730a3] flex items-center justify-center font-black group-hover:bg-[#3730a3] group-hover:text-white transition-all">3</div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Review</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Inspect your high-fidelity carbon metrics on the dashboard.</p>
            </div>
          </div>
          <div className="flex gap-5 group">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-[#10b981] flex items-center justify-center font-black group-hover:bg-[#10b981] group-hover:text-white transition-all">4</div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Secure</h4>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Click 'Request Access' to unlock your permanent ledger and download signed PDFs.</p>
            </div>
          </div>
          <button onClick={() => setIsHelpModalOpen(false)} className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Acknowledge Protocol</button>
        </div>
      </BaseModal>

      <BaseModal 
        isOpen={isSecurityModalOpen} 
        onClose={() => setIsSecurityModalOpen(false)} 
        title="Security & Privacy Protocol" 
        subtitle="Operational Integrity Node 3.0"
        icon="fa-shield-halved"
        darkBody={true}
      >
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex gap-5 group">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 text-emerald-400 flex items-center justify-center border border-indigo-500/20">
                <i className="fas fa-lock"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Encryption</h4>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  All session data is protected by AES-256 military-grade encryption during transit and at rest.
                </p>
              </div>
            </div>

            <div className="flex gap-5 group">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 text-emerald-400 flex items-center justify-center border border-indigo-500/20">
                <i className="fas fa-microchip"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Privacy-First Extraction</h4>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  Neural processing occurs in isolated ephemeral nodes. No corporate data is used for training public models.
                </p>
              </div>
            </div>

            <div className="flex gap-5 group">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-500/10 text-emerald-400 flex items-center justify-center border border-indigo-500/20">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Auditor Confidentiality</h4>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  Sovereign infrastructure ensures that only verified auditors within your node can access the granular ledger.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 space-y-4">
            <button 
              onClick={() => setIsSecurityModalOpen(false)}
              className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-slate-200"
            >
              Close
            </button>
            <button 
              onClick={scrollToCapabilities}
              className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-indigo-500/20 transition-all"
            >
              View Full Compliance Protocol
            </button>
          </div>
        </div>
      </BaseModal>

      <BaseModal 
        isOpen={isPricingModalOpen} 
        onClose={() => setIsPricingModalOpen(false)} 
        title="Enterprise Access" 
        subtitle="Corporate Tiering"
        icon="fa-building-columns"
      >
        <div className="space-y-6">
          <p className="text-slate-600 font-medium leading-relaxed">
            Our enterprise solutions are custom-tailored to handle high-volume portfolios and multi-regional compliance needs.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
              <i className="fas fa-check text-emerald-500"></i> Unlimited PDF Processing
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
              <i className="fas fa-check text-emerald-500"></i> Dedicated Support Nodes
            </li>
            <li className="flex items-center gap-3 text-sm font-bold text-slate-700">
              <i className="fas fa-check text-emerald-500"></i> Private ESG Dashboards
            </li>
          </ul>
          <div className="pt-4 flex flex-col gap-4">
            <button onClick={() => { setIsPricingModalOpen(false); setIsRequestAccessModalOpen(true); }} className="w-full bg-[#10b981] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Request Access</button>
            <button onClick={() => setIsPricingModalOpen(false)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">Close</button>
          </div>
        </div>
      </BaseModal>

      <RequestAccessModal 
        isOpen={isRequestAccessModalOpen} 
        onClose={() => setIsRequestAccessModalOpen(false)} 
      />
    </div>
  );
};
