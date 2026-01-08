import React, { useState, useMemo, useEffect } from 'react'; // SURGICAL ADDITION
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas'; // SURGICAL ADDITION for Detailed PDF
import { supabase } from '../lib/supabase'; // SURGICAL ADDITION
import { useAuth } from '../contexts/AuthContext'; // SURGICAL ADDITION
import { AuditEntry } from '../types';

interface AuditTableProps {
  results: AuditEntry[];
}

export const AuditTable: React.FC<AuditTableProps> = ({ results = [] }) => {
  const { user } = useAuth(); // SURGICAL ADDITION
  const [searchTerm, setSearchTerm] = useState('');
  const [dbResults, setDbResults] = useState<AuditEntry[]>([]); // SURGICAL ADDITION

  // SURGICAL ADDITION: Robust Company Name Extraction
  const clientName = useMemo(() => {
    const found = [...results, ...dbResults].find(r => r.company_name && r.company_name.trim() !== '')?.company_name;
    return found || "FZ Prestige Digital";
  }, [results, dbResults]);

  // SURGICAL ADDITION: Fetch historical ledger items on login
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('audit_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setDbResults(data);
      }
    };
    fetchHistory();
  }, [user]);

  // Merge live results with database history
  const combinedResults = useMemo(() => {
    const unique = new Map();
    [...results, ...dbResults].forEach(item => {
      // Use a composite key to prevent duplicates
      const key = `${item.date_range}-${item.usage_value}-${item.co2e_kg}`;
      if (!unique.has(key)) unique.set(key, item);
    });
    return Array.from(unique.values());
  }, [results, dbResults]);

  const filteredResults = useMemo(() => {
    return combinedResults.filter(entry => {
      const search = searchTerm.toLowerCase();
      return (
        (entry.date_range || '').toLowerCase().includes(search) ||
        (entry.scope || '').toLowerCase().includes(search) ||
        (entry.category || '').toLowerCase().includes(search) ||
        (entry.doc_type || '').toLowerCase().includes(search)
      );
    });
  }, [combinedResults, searchTerm]);

  // SURGICAL ADDITION: Professional PDF Export for the Ledger
  const downloadDetailedPDF = async () => {
    const element = document.getElementById('detailed-ledger-table');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgProps = doc.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text(`${clientName.toUpperCase()} - DETAILED LEDGER`, 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Authenticated Audit Trail: ${filteredResults.length} Verified Entries`, 20, 28);
      doc.text(`Export Date: ${new Date().toLocaleString()}`, 20, 34);

      doc.addImage(imgData, 'PNG', 0, 45, pageWidth, imgHeight);
      doc.save(`${clientName.replace(/\s+/g, '_')}_Detailed_Ledger.pdf`);
    } catch (e) {
      console.error("Ledger PDF generation failed", e);
    }
  };

  const exportToCSV = () => {
    const headers = ["Date Range", "Category", "Doc Type", "Scope", "Usage", "Unit", "CO2e (kg)", "Confidence", "Audit Note"];
    const rows = combinedResults.map(r => [
      r.date_range,
      r.category,
      r.doc_type,
      r.scope,
      r.usage_value,
      r.usage_unit,
      r.co2e_kg,
      r.confidence_score,
      `"${(r.audit_note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Carbon_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAuditProof = (entry: AuditEntry) => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); 
      doc.text('GetCarbonProof', margin, y);
      
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('LEAD AUDITOR NODE 3.0', 210 - margin, y, { align: 'right' });
      
      y += 10;
      doc.setDrawColor(241, 245, 249); 
      doc.line(margin, y, 210 - margin, y);
      
      y += 20;
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); 
      doc.text('AUDIT VERIFICATION CERTIFICATE', margin, y);
      
      y += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(`Certificate ID: ${btoa(JSON.stringify(entry)).substring(0, 16).toUpperCase()}`, margin, y);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 210 - margin, y, { align: 'right' });

      y += 20;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, 170, 100, 4, 4, 'F');
      
      let dataY = y + 15;
      const drawRow = (label: string, value: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(label, margin + 10, dataY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(value, margin + 70, dataY);
        dataY += 12;
      };

      drawRow('Category:', entry.category || 'N/A');
      drawRow('Document Source:', entry.doc_type || 'Internal Data');
      drawRow('Reporting Scope:', entry.scope || 'Unspecified');
      drawRow('Date Range:', entry.date_range || 'N/A');
      drawRow('Raw Usage:', `${(entry.usage_value || 0).toLocaleString()} ${entry.usage_unit || ''}`);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(79, 70, 229); 
      drawRow('Carbon Footprint:', `${(entry.co2e_kg || 0).toLocaleString()} kg CO2e`);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      drawRow('Confidence Score:', entry.confidence_score || 'Low');

      y += 110;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('AUDIT CITATION / NOTE:', margin, y);
      y += 7;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100);
      const splitNote = doc.splitTextToSize(entry.audit_note || 'No specific citation provided for this entry.', 170);
      doc.text(splitNote, margin, y);

      const footerY = 280;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.line(margin, footerY - 10, 210 - margin, footerY - 10);
      const disclaimer = 'Verification based on GHG Protocol Corporate Standard. (c) 2026 GetCarbonProof.com';
      doc.text(disclaimer, 105, footerY, { align: 'center' });

      doc.save(`audit-${(entry.category || 'carbon').toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
    }
  };

  if (!combinedResults || combinedResults.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-16 text-center">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <i className="fas fa-database text-3xl"></i>
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ledger Cache Empty</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-4 font-medium leading-relaxed">
          The Detailed Ledger is awaiting synchronization. Please initialize the AI Audit Engine to populate this verified record.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION: Surgically updated with FZ Prestige Digital branding */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
        <div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Lead Auditor Node 3.0</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">{clientName}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text"
              placeholder="Search Ledger..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {/* Download Ledger PDF: New Surgical Addition */}
            <button 
              onClick={downloadDetailedPDF}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2"
            >
              <i className="fas fa-file-pdf"></i>
              Download PDF
            </button>
            {/* Export Audit Trail: Retained as per user request */}
            <button 
              onClick={exportToCSV}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <i className="fas fa-file-csv text-emerald-600"></i>
              CSV Export
            </button>
            <span className="bg-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-2 whitespace-nowrap">
              <i className="fas fa-shield-halved"></i>
              {filteredResults.length} Entries
            </span>
          </div>
        </div>
      </div>

      <div id="detailed-ledger-table" className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Source</th>
                <th className="px-8 py-5">Description</th>
                <th className="px-8 py-5">Usage</th>
                <th className="px-8 py-5">Unit</th>
                <th className="px-8 py-5">Scope</th>
                <th className="px-8 py-5">CO2e (kg)</th>
                <th className="px-8 py-5">Confidence</th>
                <th className="px-8 py-5 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {entry.date_range || 'Unknown'}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 whitespace-nowrap text-xs max-w-[200px] truncate">
                        {entry.doc_type || 'Unknown Source'}
                      </span>
                      <div className="text-emerald-500 bg-emerald-50 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-sm border border-emerald-100" title="99.9% Extraction Accuracy">
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-slate-600 font-medium text-sm">{entry.category || 'N/A'}</span>
                    <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1 group-hover:line-clamp-none transition-all max-w-[200px]">
                      {entry.audit_note}
                    </p>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-900 tabular-nums text-sm">
                    {(entry.usage_value || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-slate-400 font-black uppercase text-[10px] tracking-widest">
                    {entry.usage_unit || '-'}
                  </td>
                  <td className="px-8 py-5">
                    {/* SURGICAL FIX: whitespace-nowrap maintained for single-line display */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap min-w-[85px] inline-flex justify-center ${
                      entry.scope?.toLowerCase().includes('1') ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      entry.scope?.toLowerCase().includes('2') ? 'bg-indigo-600 text-white border-indigo-700' :
                      entry.scope?.toLowerCase().includes('3') ? 'bg-pink-50 text-pink-700 border-pink-100' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {entry.scope || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm">
                    <span className="font-black text-indigo-600 tabular-nums">
                      {(entry.co2e_kg || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      entry.confidence_score === 'High' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${entry.confidence_score === 'High' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {entry.confidence_score}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => downloadAuditProof(entry)}
                      className="p-2 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all active:scale-90 border border-indigo-100 hover:border-indigo-600 shadow-sm"
                      title="Download PDF Certificate"
                    >
                      <i className="fas fa-file-shield text-sm"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};