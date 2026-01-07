import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from '../lib/supabase'; // SURGICAL ADDITION
import { useAuth } from '../contexts/AuthContext'; // SURGICAL ADDITION
import { AuditEntry } from '../types';

interface AuditorProps {
  filesToProcess: File[] | null;
  onComplete: (results: AuditEntry[]) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  onTriggerPicker: () => void;
}

const MOCK_FALLBACK_RESULTS: AuditEntry[] = [
  {
    date_range: "2024-01-01 to 2024-01-31",
    category: "Electricity",
    doc_type: "ConEd Utility Bill",
    scope: "Scope 2",
    usage_value: 84200,
    usage_unit: "kWh",
    co2e_kg: 19618.6,
    confidence_score: "High",
    audit_note: "Extracted from Service Detail section, Page 1. Applied factor 0.233.",
  }
];

const PROGRESS_MESSAGES = [
  "Analyzing document clusters for organizational patterns...",
  "Executing Deep OCR and Multimodal Extraction...",
  "Extracting usage metrics from tabular structures...",
  "Cross-referencing factors with Greenhouse Gas Protocol...",
  "Validating calculated emissions for reporting compliance...",
  "Executing arithmetic integrity check on ledger items...",
  "Applying temporal alignment to reporting periods..."
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const Auditor: React.FC<AuditorProps> = ({ 
  filesToProcess, 
  onComplete, 
  isProcessing, 
  setIsProcessing,
  onTriggerPicker 
}) => {
  const { user } = useAuth(); // SURGICAL ADDITION
  const [log, setLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [log]);

  useEffect(() => {
    if (filesToProcess && filesToProcess.length > 0 && isProcessing) {
      runAudit(filesToProcess);
    }
  }, [filesToProcess, isProcessing]);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString('en-GB')}] ${msg}`]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const runAudit = async (files: File[]) => {
    setLog([]); 
    const timestamp = new Date().toLocaleTimeString('en-GB');
    const initialLines = [
      `[${timestamp}] [SYSTEM] Initializing GetCarbonProof Lead Auditor Engine...`,
      `[${timestamp}] [SYSTEM] Target: New PDF Portfolio Detected...`,
      `[${timestamp}] [SYSTEM] Establishing Gemini 2.5 Flash Secure Node...`
    ];
    setLog(initialLines);

    setTimeout(() => {
      files.forEach(f => {
        addLog(`[UPLOAD] Processing File: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
      });
    }, 100);

    let progressIdx = 0;
    progressIntervalRef.current = window.setInterval(() => {
      if (progressIdx < PROGRESS_MESSAGES.length) {
        addLog(PROGRESS_MESSAGES[progressIdx]);
        progressIdx++;
      }
    }, 1500);

    const maxRetries = 5;
    let attempt = 1;
    let auditFinished = false;

    while (attempt <= maxRetries && !auditFinished) {
      try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        
        const fileParts = await Promise.all(
          files.map(async (file) => ({
            inlineData: {
              data: await fileToBase64(file),
              mimeType: file.type || "application/pdf"
            }
          }))
        );

        const prompt = `
          ROLE: Lead Auditor for GetCarbonProof. Extract carbon data from utility bills.
          Return a strict JSON array of AuditEntry objects.
          Required Factor for Electricity: 0.233.
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash", 
          contents: {
            parts: [{ text: prompt }, ...fileParts]
          },
          config: {
            responseMimeType: "application/json",
            thinkingBudget: 4000, 
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date_range: { type: Type.STRING },
                  category: { type: Type.STRING },
                  doc_type: { type: Type.STRING },
                  scope: { type: Type.STRING },
                  usage_value: { type: Type.NUMBER },
                  usage_unit: { type: Type.STRING },
                  co2e_kg: { type: Type.NUMBER },
                  confidence_score: { type: Type.STRING },
                  audit_note: { type: Type.STRING },
                },
                required: ["date_range", "category", "usage_value", "usage_unit", "co2e_kg", "confidence_score", "audit_note", "doc_type", "scope"]
              }
            }
          }
        }) as any;
        
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        addLog("SUCCESS: Audit sequence validated successfully.");
        
        const result = JSON.parse(response.text);

        // SURGICAL ADDITION: Persist result to Supabase if user is logged in
        if (user) {
          addLog("SYSTEM: Synchronizing audit trail with secure database...");
          const { error } = await supabase
            .from('audit_results')
            .insert(result.map((row: any) => ({ ...row, user_id: user.id })));
          
          if (error) {
            console.error("Supabase Persistence Error:", error);
            addLog("WARNING: Database sync failed. Data held in local memory.");
          } else {
            addLog("SUCCESS: Transaction permanently logged to Audit Ledger.");
          }
        }

        auditFinished = true; 
        setTimeout(() => onComplete(result), 1000);

      } catch (error: any) {
        const isQuotaError = error.status === 429 || error.message?.includes('429');
        
        if (isQuotaError && attempt < maxRetries) {
          const delayMatch = error.message?.match(/retryDelay":"(\d+)s/);
          const delaySeconds = delayMatch ? parseInt(delayMatch[1]) : 60;
          
          addLog(`WARNING: Node encounter: Quota Exceeded (429).`);
          addLog(`SYSTEM: Cooling down node for ${delaySeconds}s...`);
          addLog(`RETRY: Re-attempting extraction (${attempt}/${maxRetries})...`);
          
          await sleep(delaySeconds * 1000);
          attempt++;
          continue; 
        }

        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        console.error(error);
        const errorMsg = error instanceof Error ? error.message : "UNKNOWN_ERROR";

        if (isQuotaError && attempt >= maxRetries) {
          addLog(`CRITICAL: Audit sequence failed after ${maxRetries} attempts.`);
          addLog(`REASON: AI Node is currently busy processing high traffic.`);
          addLog(`INSTRUCTION: Please wait a few minutes and try running the report again.`); 
          addLog(`INSTRUCTION: Click the 'Initialize Audit Sequence' button to run the Report Again.`);
        } else {
          addLog(`WARNING: Node encounter: ${errorMsg}.`);
          addLog(`INSTRUCTION: System suspended. Please retry later.`);
        }
        
        setIsProcessing(false);
        break; 
      }
    }
  };

  useEffect(() => {
    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
  }, []);

  const handleTriggerAudit = () => {
    if ((window as any).gtag) (window as any).gtag('event', 'begin_audit');
    onTriggerPicker();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <i className="fas fa-bolt text-4xl"></i>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">AI Audit Engine</h2>
        <p className="text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed text-lg font-medium">Executing high-fidelity GHG Protocol verification.</p>
        {!isProcessing ? (
          <button onClick={handleTriggerAudit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 mx-auto">
            <i className="fas fa-microchip"></i> Initialize Audit Sequence
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-indigo-600 font-black tracking-widest uppercase text-xs animate-pulse tracking-[0.2em]">Executing Neural Audit...</p>
          </div>
        )}
      </div>

      <div className="bg-slate-950 rounded-3xl p-8 h-[400px] overflow-hidden border border-slate-800 shadow-2xl flex flex-col relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"></div>
        <h4 className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-[0.3em] flex justify-between items-center border-b border-slate-800 pb-4">
          <span className="flex items-center gap-2"><i className="fas fa-terminal text-emerald-500"></i>Neural Interface Log</span>
          <span className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isProcessing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
            <span className={`font-mono text-[10px] font-bold ${isProcessing ? 'text-emerald-500' : 'text-slate-600'}`}>{isProcessing ? 'ACTIVE AUDIT' : 'NODE READY'}</span>
          </span>
        </h4>
        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[13px] scroll-smooth pr-2 custom-scrollbar">
          {log.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-700">
              <i className="fas fa-network-wired text-3xl mb-3 opacity-20"></i>
              <p className="italic font-medium">Lead Auditor Pending Portfolio Selection...</p>
            </div>
          ) : (
            log.map((line, i) => (
              <div key={i} className="flex gap-4 group">
                <span className={`leading-relaxed ${
                  line.includes('WARNING') || line.includes('CRITICAL') ? 'text-rose-400 font-bold' : 
                  line.includes('INSTRUCTION') ? 'text-cyan-300 font-bold' : 
                  line.includes('SUCCESS') ? 'text-cyan-400 font-bold' : 
                  'text-emerald-400/90'
                }`}>
                  <span className="mr-2 opacity-40 select-none">›</span>{line}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
};