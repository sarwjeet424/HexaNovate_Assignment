// Navigation types
export interface NavItem {
  label: string;
  href: string;
  children?: NavSubItem[];
}

export interface NavSubItem {
  label: string;
  href: string;
  description?: string;
}

// Form types
export interface LeadFormData {
  name: string;
  contactNo: string;
  email: string;
  solutionRequired: string;
  noOfDocuments: string;
  painPointExpectations?: string;
  _hp?: string; // honeypot — must remain empty for real users
}

// ROI Calculator types — document types from the "Logic and Pricing" sheet
export type DocumentType =
  | 'Bank Cheques'
  | 'Bank Documents'
  | 'ID Cards'
  | 'KYC Documents'
  | 'Invoices'
  | 'Bill of Lading'
  | 'Packing List'
  | 'Purchase Orders'
  | 'Contract'
  | 'P&L Statements'
  | 'Cashflow Statement'
  | 'Trade Finance'
  | 'Insurance Claims'
  | 'Loan Applications'
  | 'Medical Records';

export type ModelType = 'Single' | 'Multi';

export interface ROIInputs {
  documentType: DocumentType | '';
  model: ModelType;
  annualVolume: number;     // pages / year
  avgMonthlySalary: number; // INR / month
}

export interface ROIOutputs {
  resourcesNeeded: number;
  monthlyManualCost: number;
  annualCost: number;
  monthlyKlearStackCost: number;
  netMonthlySavings: number;
  annualSavings: number;
  equivalentResources: number;
}

// API types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
