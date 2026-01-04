
import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setFormData({ name: '', email: '', company: '' });
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // placeholders for Vercel/Production deployment
      const serviceId = process.env.EMAILJS_SERVICE_ID || 'SERVICE_ID_PLACEHOLDER';
      const templateId = process.env.EMAILJS_TEMPLATE_ID || 'TEMPLATE_ID_PLACEHOLDER';
      const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'PUBLIC_KEY_PLACEHOLDER';

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          user_email: formData.email,
          company_name: formData.company,
          message: `Request for Enterprise Access from ${formData.name} at ${formData.company}.`,
        },
        publicKey
      );
      setSuccess(true);
    } catch (error) {
      console.error('EmailJS Error:', error);
      alert('Initialization sequence failed. Please verify network connectivity and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        {/* Header: Dark Indigo */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <i className="fas fa-user-lock text-indigo-400 text-2xl"></i>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <h3 className="text-2xl font-black tracking-tight relative z-10">Request Enterprise Access</h3>
          <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1 relative z-10">Operational Integrity Node 3.0</p>
        </div>

        <div className="p-10">
          {success ? (
            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                <i className="fas fa-check text-3xl"></i>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Sequence Initialized</h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Our team will contact you within 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="j.doe@enterprise.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Global Sustain Corp"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-300"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <i className="fas fa-circle-notch animate-spin"></i>
                  ) : (
                    <>
                      <i className="fas fa-bolt-lightning"></i>
                      Initialize Sequence
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
