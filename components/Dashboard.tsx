
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import { AuditEntry } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  results: AuditEntry[];
  isProcessing?: boolean;
  isSample?: boolean;
  onAuthRequired?: () => void;
  onSignInRequired?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ results, isProcessing, isSample, onAuthRequired, onSignInRequired }) => {
  const { user } = useAuth();

  const summary = useMemo(() => {
    const total = results.reduce((acc, curr) => acc + (Number(curr.co2e_kg) || 0), 0);
    const docSources = Array.from(new Set(results.map(r => r.doc_type).filter(Boolean)));
    const docCount = docSources.length;
    
    const scopeData = [
      { name: 'Scope 1', value: 0, color: '#6366f1' },
      { name: 'Scope 2', value: 0, color: '#8b5cf6' },
      { name: 'Scope 3', value: 0, color: '#ec4899' },
    ];

    results.forEach(r => {
      const scopeStr = (r.scope || '').toLowerCase();
      const catStr = (r.category || '').toLowerCase();
      const val = Number(r.co2e_kg) || 0;
      
      if (scopeStr.includes('1') || catStr.includes('fuel') || catStr.includes('diesel') || catStr.includes('gas')) {
        scopeData[0].value += val;
      } else if (scopeStr.includes('2') || catStr.includes('electricity') || catStr.includes('utility')) {
        scopeData[1].value += val;
      } else {
        scopeData[2].value += val;
      }
    });

    let overallConfidence = 'Pending';
    if (isProcessing) {
      overallConfidence = 'Evaluating...';
    } else if (results.length > 0) {
      const scores = results.map(r => r.confidence_score);
      if (scores.includes('Low')) overallConfidence = 'Low';
      else if (scores.every(s => s === 'High')) overallConfidence = 'High';
      else overallConfidence = 'Medium';
    }

    return { total, docCount, docSources, overallConfidence, scopeData };
  }, [results, isProcessing]);

  const downloadSummaryPDF = () => {
    if (!user) return;
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(55, 48, 163); 
      doc.text('GetCarbonProof', margin, y);
      
      y += 20;
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('EXECUTIVE AUDIT SUMMARY', margin, y);
      
      y += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Footprint: ${(summary.total / 1000).toFixed(2)} tonnes CO2e`, margin, y);
      y += 10;
      doc.text(`Confidence: ${summary.overallConfidence}`, margin, y);
      y += 10;
      doc.text(`Authenticated User: ${user.email}`, margin, y);
      
      doc.save('Executive_Carbon_Audit_Summary.pdf');
    } catch (e) {
      console.error("PDF generation failed", e);
    }
  };

  if (isProcessing && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-indigo-600 bg-white rounded-3xl border border-slate-200 shadow-sm animate-pulse">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold">Synchronizing Executive View...</p>
        <p className="text-sm text-slate-400 mt-2">Connecting to AI node for isolated portfolio verification</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Sample Watermark Overlay */}
      {isSample && (
        <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
          <div className="text-[12rem] font-black text-slate-100 rotate-[-35deg] select-none opacity-20 whitespace-nowrap uppercase tracking-widest">
            Sample Report
          </div>
        </div>
      )}

      {isSample && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <i className="fas fa-circle-info"></i>
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Demonstration Mode Active</h4>
            <p className="text-xs text-amber-700">This view represents a validated audit of 19.62 tonnes CO2e based on a standard utility profile.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <i className="fas fa-leaf text-xl"></i>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Footprint</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-slate-900">
              {(summary.total / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-slate-500 font-medium">tonnes CO2e</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-bold uppercase tracking-tighter">
            {summary.total.toLocaleString()} kg Verified aggregate
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <i className="fas fa-file-contract text-xl"></i>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Documents Audited</span>
          </div>
          <h3 className="text-4xl font-black text-slate-900">{summary.docCount}</h3>
          <p className="text-slate-500 text-xs mt-2 truncate font-bold uppercase tracking-tight">
            {summary.docSources.length > 0 ? summary.docSources.join(' • ') : 'No Evidence Processed'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <i className="fas fa-award text-xl"></i>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Confidence</span>
          </div>
          <h3 className={`text-4xl font-black ${
            summary.overallConfidence === 'High' ? 'text-emerald-600' : 
            summary.overallConfidence === 'Medium' ? 'text-amber-500' : 
            summary.overallConfidence === 'Pending' ? 'text-slate-300' : 'text-rose-500'
          }`}>
            {summary.overallConfidence}
          </h3>
          <p className="text-slate-500 text-xs mt-2 font-medium">
            AI validation rating
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-[480px]">
          <h4 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-600"></i>
            Carbon Scope Breakdown
            <div className="group relative ml-1 inline-flex items-center">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center cursor-help shadow-sm border border-slate-200/50 hover:bg-slate-200 transition-colors">
                <i className="fas fa-info text-[10px] text-[#1e3a8a]"></i>
              </div>
              <div className="absolute left-0 top-full mt-3 w-72 p-6 bg-slate-900/95 backdrop-blur-md text-white rounded-[1.5rem] shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50 border border-slate-800 space-y-4">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-3 mb-1">Scope Protocol Definitions</div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#6366f1' }}>Scope 1</p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Direct emissions from sources owned or controlled.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#8b5cf6' }}>Scope 2</p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Indirect Energy emissions from purchased electricity, steam, heat, or cooling.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#ec4899' }}>Scope 3</p>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    Other indirect emissions in the value chain.
                  </p>
                </div>
              </div>
            </div>
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            {results.length > 0 ? (
              <PieChart>
                <Pie
                  data={summary.scopeData.filter(d => d.value > 0)}
                  innerRadius={100}
                  outerRadius={150}
                  paddingAngle={10}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {summary.scopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontFamily: 'Inter' }} 
                  formatter={(value: number) => [`${value.toLocaleString()} kg CO2e`, 'Emissions']} 
                />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 font-medium italic">
                Pending Portfolio Audit...
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-[480px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <i className="fas fa-poll text-indigo-600"></i>
              Impact by Category (kg)
            </h4>
            
            {/* Conditional Export Control */}
            {results.length > 0 && (
              user ? (
                <button 
                  onClick={downloadSummaryPDF}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <i className="fas fa-file-pdf"></i>
                  Download Signed PDF
                </button>
              ) : (
                <button 
                  onClick={onSignInRequired}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In to Save
                </button>
              )
            )}
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="90%">
              {results.length > 0 ? (
                <BarChart data={results.filter(r => r.co2e_kg > 0).sort((a, b) => b.co2e_kg - a.co2e_kg).slice(0, 8)}>
                  <XAxis 
                    dataKey="category" 
                    tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                    axisLine={false} 
                    tickLine={false} 
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontFamily: 'Inter' }} 
                  />
                  <Bar 
                    dataKey="co2e_kg" 
                    fill="#6366f1" 
                    radius={[8, 8, 0, 0]} 
                    animationDuration={1800}
                    barSize={40}
                  />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300 font-medium italic">
                  Awaiting Source Data...
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
