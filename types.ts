
export interface AuditEntry {
  date_range: string;
  category: string;
  scope?: string;
  usage_value: number;
  usage_unit: string;
  co2e_kg: number;
  confidence_score: "High" | "Medium" | "Low";
  audit_note: string;
  doc_type: string;
}

export enum DocType {
  ESG_REPORT = 'ESG Report',
  UTILITY_BILL = 'Utility Bill',
  REGULATORY_LETTER = 'Regulatory Letter'
}

export interface AuditSummary {
  total_emissions: number;
  doc_count: number;
  scope_breakdown: {
    scope1: number;
    scope2: number;
    scope3: number;
  };
}
