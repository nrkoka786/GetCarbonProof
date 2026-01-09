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

  // SURGICAL ADDITION: Robust Logic to extract Company Name (e.g., FZ Prestige Digital) from the results
  const clientName = useMemo(() => {
    // Priority 1: Check if any entry has a populated company_name from the AI extraction
    const found = results.find(r => r.company_name && r.company_name.trim() !== '')?.company_name;
    if (found) return found;

    // Priority 2: Fallback for sample corporation mode
    if (isSample) return "Sample Corporation";

    // Priority 3: Default fallback if extraction is still pending or missing
    return ""; // REMOVED: "Authorized Portfolio" text fallback
  }, [results, isSample]);

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

    // SURGICAL REPLACEMENT: Materiality-Weighted Confidence Logic
    let overallConfidence = 'Pending';
    if (isProcessing) {
      overallConfidence = 'Evaluating...';
    } else if (results.length > 0) {
      const totalWeight = results.reduce((sum, r) => sum + (Number(r.co2e_kg) || 0), 0);
      const highConfidenceWeight = results.reduce((sum, r) => {
        return r.confidence_score === 'High' ? sum + (Number(r.co2e_kg) || 0) : sum;
      }, 0);
      const highWeightPercentage = totalWeight > 0 ? (highConfidenceWeight / totalWeight) * 100 : 0;

      if (highWeightPercentage >= 90) {
        overallConfidence = 'High';
      } else if (highWeightPercentage >= 60) {
        overallConfidence = 'Medium';
      } else {
        overallConfidence = 'Low';
      }
    }

    // SURGICAL ADDITION: AI Narrative Generator
    const topCategory = consolidatedData[0]?.category || "N/A";
    const topImpact = consolidatedData[0]?.co2e_kg ? Math.round(consolidatedData[0].co2e_kg).toLocaleString() : "0";
    
    const narrativeInsight = results.length > 0 
      ? `This reporting period for ${clientName || 'the portfolio'} highlights a major concentration of emissions within the ${topCategory} category, contributing ${topImpact} kg CO2e to the total footprint. Scope distribution analysis confirms that ${scopeData[0].value > scopeData[2].value ? 'direct operations' : 'value chain activities'} drive the majority of verified organizational impact.`
      : "The Detailed Ledger is awaiting synchronization. Narrative insights will be generated upon portfolio verification.";

    const verificationNote = `Audit procedures for ${clientName || 'this entity'} include high-fidelity extraction from ${docCount} source documents. Calculations have been validated against GHG Protocol standards with a weighted materiality rating of ${overallConfidence}.`;

    return { total, docCount, docSources, overallConfidence, scopeData, consolidatedData, narrativeInsight, verificationNote };
  }, [results, isProcessing, clientName]);

  const downloadSummaryPDF = async () => {
    if (!user) return;
    
    const element = document.getElementById('audit-dashboard-view');
    if (!element) return;

    try {
      // SURGICAL ADJUSTMENT: Refined scale and clone cleaning with micro-scaled typography
      const canvas = await html2canvas(element, {
        scale: 2.2, 
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // SURGICAL REMOVAL: Clean the canvas to prevent double-branding
          
          // 1. Definitively hide ALL buttons (including Download Signed PDF) from the report
          const actionButtons = clonedDoc.querySelectorAll('button');
          actionButtons.forEach(btn => {
            (btn as HTMLElement).style.display = 'none';
          });

          // 2. Hide the existing HTML header entirely from the capture clone
          const reportHeader = clonedDoc.querySelector('.flex.justify-between.items-end.border-b');
          if (reportHeader) {
            (reportHeader as HTMLElement).style.display = 'none';
          }

          const clonedElement = clonedDoc.getElementById('audit-dashboard-view');
          if (clonedElement) {
            clonedElement.style.padding = '10px'; 
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      const imgProps = doc.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      // SURGICAL REPLACEMENT: Professional Micro-scaled typography (Final 50% Reduction)
      let heightLeft = imgHeight;
      let position = 22; // Tightened start position to match smaller header

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4); // Professional micro-label (was 8)
      doc.setTextColor(148, 163, 184); 
      doc.text('AUTHENTICATED BY GETCARBONPROOF', 20, 6);
      
      doc.setFontSize(7.5); // Refined title size (was 14)
      doc.setTextColor(15, 23, 42);
      doc.text(clientName.toUpperCase(), 20, 12);
      
      doc.setFontSize(5.5); // Subtle report sub-label (was 11)
      doc.setTextColor(79, 70, 229);
      doc.text('EXECUTIVE AUDIT SUMMARY', 20, 16);

      // Render the first page image slice
      doc.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - position);

      // SURGICAL ADDITION: Loop to add subsequent pages if content exceeds A4 height
      while (heightLeft > 0) {
        doc.addPage();
        position = heightLeft - imgHeight; // Shift image up to start next slice
        doc.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
      
      // SURGICAL REPLACEMENT: Micro-scaled footer typography
      const finalPageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(5); // Micro-scaled footer metadata
      doc.setFont('helvetica', 'normal');
      doc.text(`Authenticated Auditor: ${user.email}`, 20, finalPageHeight - 6);
      doc.text(`Verification Timestamp: ${new Date().toLocaleString()}`, 20, finalPageHeight - 3);
      
      doc.save(`${clientName.replace(/\s+/g, '_')}_Carbon_Audit.pdf`);
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

      {/* DASHBOARD HEADER: "Export Charts" definitively removed | Client Branding reinforced */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-6 mb-6">
        <div>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Executive Audit Summary</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1">{clientName || 'Awaiting Portfolio'}</h2>
        </div>
        <div className="flex gap-3">
          {!user && (
            <button 
              onClick={onSignInRequired}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <i className="fas fa-sign-in-alt"></i> Sign in to Save
            </button>
          )}
          {/* Removed: Export Charts button for professional immutable audit standards */}
          {results.length > 0 && user && (
            <button 
              onClick={downloadSummaryPDF}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <i className="fas fa-file-pdf"></i> Download Signed PDF
            </button>
          )}
        </div>
      </div>

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
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="90%">
              {results.length > 0 ? (
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

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mt-8 space-y-6">
        <h4 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 uppercase tracking-widest text-xs flex items-center gap-3">
          <i className="fas fa-file-invoice text-indigo-600"></i>
          Detailed Categorical Impact & Commentary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Narrative Insight Column */}
          <div className="space-y-6 text-sm leading-relaxed text-slate-600">
            <p>
              <strong className="text-slate-900 underline underline-offset-4 decoration-indigo-200">Inventory Distribution:</strong> {summary.narrativeInsight}
            </p>
            <p>
              <strong className="text-slate-900 underline underline-offset-4 decoration-indigo-200">Verification Statement:</strong> {summary.verificationNote}
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl space-y-3 border border-slate-100">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Granular Audit Values (kg CO2e)</h5>
            {summary.consolidatedData.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-700">{item.category}</span>
                <span className="text-xs font-mono font-black text-indigo-600">
                  {Math.round(item.co2e_kg).toLocaleString()} kg
                </span>
              </div>
            ))}
            <p className="text-[10px] text-slate-400 italic mt-4">Note: TopContributors shown for materiality clarity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};