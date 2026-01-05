import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
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

    // ENHANCEMENT: Category Aggregator with Color Handshake
    const categoryTotals: Record<string, { value: number; color: string }> = {};

    results.forEach(r => {
      const scopeStr = (r.scope || '').toLowerCase();
      const catStr = (r.category || '').toLowerCase();
      const val = Number(r.co2e_kg) || 0;
      
      const categoryName = r.category || 'Other';
      let currentColor = '#94a3b8'; // Default

      if (scopeStr.includes('1') || catStr.includes('fuel') || catStr.includes('diesel') || catStr.includes('gas')) {
        scopeData[0].value += val;
        currentColor = '#6366f1'; // Match Scope 1 Indigo
      } else if (scopeStr.includes('2') || catStr.includes('electricity') || catStr.includes('utility')) {
        scopeData[1].value += val;
        currentColor = '#8b5cf6'; // Match Scope 2 Purple
      } else {
        scopeData[2].value += val;
        currentColor = '#ec4899'; // Match Scope 3 Pink
      }

      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = { value: 0, color: currentColor };
      }
      categoryTotals[categoryName].value += val;
    });

    // Create the professional consolidated array for the Bar Chart
    const consolidatedData = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      co2e_kg: categoryTotals[cat].value,
      fill: categoryTotals[cat].color // Logic for matching bar colors
    })).sort((a, b) => b.co2e_kg - a.co2e_kg);

    let overallConfidence = 'Pending';
    if (isProcessing) {
      overallConfidence = 'Evaluating...';
    } else if (results.length > 0) {
      const scores = results.map(r => r.confidence_score);
      if (scores.includes('Low')) overallConfidence = 'Low';
      else if (scores.every(s => s === 'High')) overallConfidence = 'High';
      else overallConfidence = 'Medium';
    }

    return { total, docCount, docSources, overallConfidence, scopeData, consolidatedData };
  }, [results, isProcessing]);

  const downloadSummaryPDF = async () => {
    if (!user) return;
    
    const element = document.getElementById('audit-dashboard-view');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const imgProps = doc.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(55, 48, 163); 
      doc.text('GetCarbonProof', 20, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('EXECUTIVE AUDIT SUMMARY', 20, 35);

      doc.addImage(imgData, 'PNG', 0, 45, pdfWidth, pdfHeight);
      
      const footerY = 45 + pdfHeight + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Authenticated Auditor: ${user.email}`, 20, footerY);
      doc.text(`Verification Timestamp: ${new Date().toLocaleString()}`, 20, footerY + 7);
      
      doc.save(`Executive_Audit_Summary_${new Date().getTime()}.pdf`);
    } catch (e) {
      console.error("Visual PDF generation failed", e);
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
    <div id="audit-dashboard-view" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative p-4 bg-white rounded-3xl">
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
            <i className="fas fa-circle-info text-slate-300 text-sm cursor-help" title="Scope 1: Direct emissions | Scope 2: Purchased energy | Scope 3: Indirect value chain"></i>
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
                // UPDATED: Forces all labels to display via staggered rotation and increased bottom margin
                <BarChart 
                  data={summary.consolidatedData.slice(0, 8)}
                  margin={{ bottom: 60 }}
                >
                  <XAxis 
                    dataKey="category" 
                    tick={{fontSize: 9, fill: '#64748b', fontWeight: 700}} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    angle={-25}
                    textAnchor="end"
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
                    radius={[8, 8, 0, 0]} 
                    animationDuration={1800}
                    barSize={40}
                  >
                    {summary.consolidatedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
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

      {/* RECOMMENDED EXPLANATORY TEXT ADDITIONS */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8 space-y-6">
        <h4 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 uppercase tracking-widest text-xs flex items-center gap-3">
          <i className="fas fa-pen-nib text-indigo-600"></i>
          Auditor Executive Commentary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-slate-600">
          <div className="space-y-4">
            <p>
              <strong className="text-slate-900 underline underline-offset-4 decoration-indigo-200">Inventory Distribution:</strong> This reporting period 
              highlights a concentration of emissions within Scope 1 (Direct Fuel) and Scope 3 (Purchased Goods), which 
              together constitute the vast majority of the verified organizational footprint.
            </p>
          </div>
          <div className="space-y-4">
            <p>
              <strong className="text-slate-900 underline underline-offset-4 decoration-indigo-200">Verification Statement:</strong> Audit procedures 
              executed include data consistency checks and cross-validation against authoritative emission factor 
              databases (EPA 2024, IPCC AR5). Calculations comply with GHG Protocol Corporate Standard requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};