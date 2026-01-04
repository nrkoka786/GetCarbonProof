
import React from 'react';
import { AuditEntry } from '../types';

interface JsonViewProps {
  results: AuditEntry[];
}

export const JsonView: React.FC<JsonViewProps> = ({ results }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    alert('JSON copied to clipboard');
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden h-[70vh] flex flex-col">
      <div className="p-4 bg-slate-800 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-xs font-mono text-slate-400">audit_results_master.json</span>
        </div>
        <button 
          onClick={handleCopy}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md transition-colors"
        >
          Copy Code
        </button>
      </div>
      <pre className="flex-1 p-6 text-indigo-300 font-mono text-sm overflow-auto selection:bg-indigo-500 selection:text-white">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
};
