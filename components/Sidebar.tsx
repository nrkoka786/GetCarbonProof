import React from 'react';

const Logo = ({ className, textColor = 'white' }: { className?: string, textColor?: string }) => (
  <svg 
    viewBox="0 0 550 100" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
    style={{ paddingRight: '10px', overflow: 'visible' }}
  >
    {/* Deep Indigo Shield Layer with modern rounded profile */}
    <path 
      d="M50 8 L18 22 Q15 24 15 28 V50 C15 75 50 92 50 92 C50 92 85 75 85 50 V28 Q85 24 82 22 L50 8 Z" 
      fill="#3730a3" 
    />
    
    {/* Organic Asymmetric Leaf Layer - Perfectly Centered within Shield */}
    <g>
      <path 
        d="M38 65 C28 52 36 29 64 32 C74 47 56 75 38 65 Z" 
        fill="#10b981" 
      />
      {/* Small stem at the base of the leaf */}
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

interface SidebarProps {
  activeTab: 'dashboard' | 'table' | 'auditor';
  setActiveTab: (tab: 'dashboard' | 'table' | 'auditor') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Executive Audit', icon: 'fa-chart-line' },
    { id: 'table', label: 'Detailed Ledger', icon: 'fa-list-ul' },
    { id: 'auditor', label: 'AI Audit Engine', icon: 'fa-microchip' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-6 z-10 border-r border-slate-800">
      <div className="mb-10 px-1 flex items-center w-full overflow-visible">
        <Logo className="h-8 w-auto" textColor="white" />
      </div>

      <nav className="space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-10 left-6 right-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Audit Status</h4>
        <div className="flex items-center gap-2 text-sm text-green-400">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          AI Engine Online
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Gemini 3 Pro-Preview Active</p>
      </div>
    </aside>
  );
};