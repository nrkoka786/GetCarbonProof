
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import emailjs from 'emailjs-com';
import { AuditEntry } from '../types';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  persistAuditResults: (results: AuditEntry[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const persistAuditResults = async (results: AuditEntry[]) => {
    if (!user || results.length === 0) return;

    const dataToInsert = results.map(entry => ({
      user_id: user.id,
      date_range: entry.date_range,
      category: entry.category,
      scope: entry.scope,
      usage_value: entry.usage_value,
      usage_unit: entry.usage_unit,
      co2e_kg: entry.co2e_kg,
      confidence_score: entry.confidence_score,
      audit_note: entry.audit_note,
      doc_type: entry.doc_type,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('audit_history')
      .insert(dataToInsert);

    if (error) {
      console.error('Error persisting audit results:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, persistAuditResults }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const sendSignUpNotification = async (email: string) => {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID || 'placeholder_service_id';
    const templateId = process.env.EMAILJS_TEMPLATE_ID || 'placeholder_template_id';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || 'placeholder_public_key';

    await emailjs.send(
      serviceId,
      templateId,
      { user_email: email, signup_date: new Date().toLocaleString() },
      publicKey
    );
    console.log('Notification email sent successfully');
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
};
