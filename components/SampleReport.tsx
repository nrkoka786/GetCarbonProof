import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';

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

interface SampleReportProps {
  onBack: () => void;
  onStartAudit: () => void;
}

export const SampleReport: React.FC<SampleReportProps> = ({ onBack, onStartAudit }) => {
  // Diverse Dataset for Enterprise Engine Showcase
  const sampleScopeData = [
    { name: 'Scope 1 (Direct)', value: 4250, color: '#6366f1' }, // Indigo: Fleet Fuel
    { name: 'Scope 2 (Energy)', value: 19618.6, color: '#10b981' }, // Emerald: Electricity
    { name: 'Scope 3 (Supply)', value: 1100, color: '#ec4899' }, // Pink: Waste Disposal
  ];

  const sampleCategoryData = [
    { category: 'Fleet Fuel', co2e_kg: 4250, color: '#6366f1' },
    { category: 'Electricity', co2e_kg: 19618.6, color: '#10b981' },
    { category: 'Waste Disposal', co2e_kg: 1100, color: '#ec4899' }
  ];

  const totalCO2eTonnes = 24.97;
  const evidenceCount = "03";

  const downloadSamplePDF = () => {
    // GA4 Track Event
    if ((window as any).gtag) {
      (window as any).gtag('event', 'generate_lead_sample');
    }

    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      // 1. Watermark - Diagonal
      doc.setTextColor(240, 240, 240);
      doc.setFontSize(40);
      doc.setFont('helvetica', 'bold');
      doc.saveGraphicsState();
      doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
      for (let i = 0; i < 5; i++) {
        doc.text('SAMPLE - FOR DEMONSTRATION ONLY', 105, 50 + (i * 60), { align: 'center', angle: 45 });
      }
      doc.restoreGraphicsState();

      // 2. Header Branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(55, 48, 163); // Indigo-800 (#3730a3)
      doc.text('GetCarbonProof', margin, y);
      
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text('LEAD AUDITOR NODE 3.0', 210 - margin, y, { align: 'right' });
      
      y += 12;
      doc.setDrawColor(241, 245, 249); // Slate-100
      doc.line(margin, y, 210 - margin, y);
      
      // 3. Document Title
      y += 20;
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text('ENTERPRISE CARBON AUDIT REPORT', margin, y);
      
      y += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('Reference: CP-ENT-2024-001', margin, y);
      doc.text(`Issued: ${new Date().toLocaleDateString()}`, 210 - margin, y, { align: 'right' });

      // 4. Summary Stats Grid
      y += 25;
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.roundedRect(margin, y, 170, 45, 5, 5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('AGGREGATE AUDITED FOOTPRINT', margin + 10, y + 15);
      
      doc.setFontSize(32);
      doc.setTextColor(55, 48, 163); // Indigo-800
      doc.text(totalCO2eTonnes.toFixed(2), margin + 10, y + 32);
      doc.setFontSize(14);
      doc.text('tonnes CO2e', margin + 65, y + 32);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('VERIFICATION STATUS: CERTIFIED', 210 - margin - 10, y + 15, { align: 'right' });
      doc.text('PORTFOLIO DATA FIDELITY: 100%', 210 - margin - 10, y + 25, { align: 'right' });

      // 5. Scope Breakdown Table
      y += 65;
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('Protocol Scope Attribution', margin, y);
      
      y += 10;
      doc.setFillColor(55, 48, 163); // Header BG
      doc.rect(margin, y, 170, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('SCOPE', margin + 5, y + 6.5);
      doc.text('CATEGORY SOURCE', margin + 45, y + 6.5);
      doc.text('EMISSIONS (kg CO2e)', 210 - margin - 5, y + 6.5, { align: 'right' });

      const drawScopeRow = (rowY: number, scope: string, desc: string, val: string, color: [number, number, number]) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(241, 245, 249);
        doc.rect(margin, rowY, 170, 10, 'S');
        doc.setTextColor(71, 85, 105);
        doc.text(scope, margin + 5, rowY + 6.5);
        doc.text(desc, margin + 45, rowY + 6.5);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(val, 210 - margin - 5, rowY + 6.5, { align: 'right' });
      };

      y += 10;
      drawScopeRow(y, 'Scope 1', 'Fleet Fuel (Direct)', '4,250.0', [99, 102, 241]); // Indigo
      y += 10;
      drawScopeRow(y, 'Scope 2', 'Electricity (Purchased)', '19,618.6', [16, 185, 129]); // Emerald
      y += 10;
      drawScopeRow(y, 'Scope 3', 'Waste Disposal (Indirect)', '1,100.0', [236, 72, 153]); // Pink

      // 6. Detailed Ledger Citation
      y += 35;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.text('Multi-Document Evidence Trail', margin, y);
      
      y += 10;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, 170, 35, 3, 3, 'F');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      const auditNote = "Synthesis result from 3 verified documents: 1. Q1-Q4 Fleet Management Ledger (Scope 1); 2. Consolidated Edison (ConEd) Utility Portfolio (Scope 2); 3. Municipal Waste Compliance Certificate (Scope 3). All extractions performed via GetCarbonProof Lead Auditor Neural Engine with standardized conversion factors.";
      const splitNote = doc.splitTextToSize(auditNote, 160);
      doc.text(splitNote, margin + 5, y + 10);

      // 7. Footer
      const footerY = 280;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.line(margin, footerY - 5, 210 - margin, footerY - 5);
      doc.text('Proprietary Audit Output Node 3.0 - Verified for Disclosure Compliance. (c) 2026 GetCarbonProof AI', 105, footerY + 2, { align: 'center' });

      doc.save('GetCarbonProof_Enterprise_Audit_Report.pdf');
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Error generating sample PDF. Please check console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-hidden">
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <div className="text-[14rem] font-black text-slate-100 rotate-[-35deg] select-none opacity-20 whitespace-nowrap uppercase tracking-widest">
          SAMPLE REPORT
        </div>
      </div>

      {/* Header */}
      <header className="w-full px-8 py-5 flex justify-between items-center bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={onBack}>
          <Logo className="h-8 w-auto" textColor="#1e293b" />
          <span className="ml-4 pl-4 border-l border-slate-200 text-xs font-black text-slate-400 uppercase tracking-widest">
            Enterprise Output Node
          </span>
        </div>
        <button 
          onClick={onBack}
          className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          Exit Demonstration
        </button>
      </header>

      <main className="max-w-6xl mx-auto w-full px-8 py-12 relative z-10 flex-1">
        {/* Top Summary Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Executive Audit Dashboard</h1>
            <p className="text-slate-500 font-medium font-mono text-sm tracking-tighter uppercase">
              Portfolio Summary • ID: CP-ENT-001 • Multi-Source Audit
            </p>
          </div>
          
          {/* Professional Digital Seal */}
          <div className="relative group cursor-help">
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-indigo-500/30 flex items-center justify-center animate-[spin_20s_linear_infinite] group-hover:border-indigo-500 transition-colors">
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 flex items-center justify-center"></div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <i className="fas fa-shield-check text-indigo-500 text-2xl mb-1"></i>
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-tighter leading-none">Verified by</span>
              <span className="text-[8px] font-black text-slate-900 uppercase tracking-tighter leading-none">GetCarbonProof AI</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Footprint</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-5xl font-black text-slate-900">{totalCO2eTonnes.toFixed(2)}</h3>
              <span className="text-slate-400 font-black uppercase text-xs tracking-widest">tCO2e</span>
            </div>
            <p className="text-[10px] text-indigo-600 font-black uppercase mt-4 tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Portfolio Aggregated
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#3730a3]">
                <i className="fas fa-layer-group text-xl"></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Evidence Base</span>
            </div>
            <h3 className="text-5xl font-black text-slate-900">{evidenceCount}</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase mt-4 tracking-widest">
              Verified Primary Sources
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <i className="fas fa-microchip text-xl"></i>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Fidelity</span>
            </div>
            <h3 className="text-5xl font-black text-emerald-600">100%</h3>
            <p className="text-[10px] text-emerald-600 font-black uppercase mt-4 tracking-widest">
              High Accuracy extraction
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg h-[450px]">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Protocol Scope Breakdown</h4>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={sampleScopeData}
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={2000}
                >
                  {sampleScopeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontFamily: 'Inter', fontWeight: '800' }} 
                />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg h-[450px]">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Category Intensity (kg)</h4>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={sampleCategoryData}>
                <XAxis 
                  dataKey="category" 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 900}} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontFamily: 'Inter' }} 
                />
                <Bar 
                  dataKey="co2e_kg" 
                  radius={[12, 12, 0, 0]} 
                  animationDuration={2500}
                  barSize={60}
                >
                  {sampleCategoryData.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981] opacity-10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3730a3] opacity-10 blur-[100px] rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ec4899] opacity-5 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 space-y-8">
            <h3 className="text-3xl font-black text-white tracking-tight">Ready for your own audit?</h3>
            <p className="text-slate-400 font-medium max-w-xl mx-auto">
              Automate your carbon disclosure using the same professional AI extraction logic shown in this enterprise sample report.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onStartAudit}
                className="bg-[#10b981] hover:bg-[#059669] text-white px-12 py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
              >
                <i className="fas fa-bolt-lightning"></i>
                Initialize Sequence
              </button>
              <button 
                onClick={downloadSamplePDF}
                className="bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white px-12 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
              >
                <i className="fas fa-file-pdf"></i>
                Download Sample PDF
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 bg-white border-t border-slate-100 mt-12">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 grayscale">
          <Logo className="h-6 w-auto" textColor="#1e293b" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Proprietary Verification Node • Audit Protocol v3.0 • Enterprise Engine</p>
        </div>
      </footer>
    </div>
  );
};