import type { NavItem } from '@/types';

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Product',
    href: '#',
    children: [
      { label: 'Overview', href: '#', description: 'See what KlearStack can do' },
      { label: 'How it works?', href: '#', description: 'Step-by-step document processing' },
      { label: 'Pricing', href: '#', description: 'Plans for every team size' },
    ],
  },
  {
    label: 'Solutions',
    href: '#',
    children: [
      {
        label: 'Capabilities',
        href: '#',
      },
    ],
  },
  {
    label: 'Industries',
    href: '#',
    children: [
      { label: 'BFSI', href: '#' },
      { label: 'Healthcare', href: '#' },
      { label: 'Telecom', href: '#' },
      { label: 'Manufacturing', href: '#' },
    ],
  },
  { label: 'Pricing', href: '#' },
  {
    label: 'Resources',
    href: '#',
    children: [
      { label: 'Blog', href: '#' },
      { label: 'Guides', href: '#' },
      { label: 'Newsroom', href: '#' },
      { label: 'API Documentation', href: '#' },
      { label: 'Product Documentation', href: '#' },
    ],
  },
  {
    label: 'Company',
    href: '#',
    children: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
];

export const SOLUTIONS_MEGA_MENU = {
  capabilities: ['Data Processing', 'Data Extraction', 'Data Interpretation', 'Straight Through Processing (STP)'],
  features: ['Document Processing', 'Document Interpretation', 'Document Extraction', 'Straight Through Protocol (STP)'],
  integration: ['SAP', 'Tally', 'QuickBooks', 'Custom ERP'],
  documentTypes: ['Bank Cheques', 'Invoices', 'Purchase Orders', 'KYC Documents', 'Medical Records'],
};

export const SOLUTION_OPTIONS = [
  'Accounts Payable',
  'Supply Chain',
  'Consumer Loans',
  'ID Card Verification',
  'Trade Finance',
  'Insurance Claims Processing',
  'Medical Records Extraction',
  'Custom Solution',
];

export const DOCUMENT_VOLUME_OPTIONS = [
  '< 1,000',
  '1,000 – 10,000',
  '10,001 – 50,000',
  '50,001 – 1,00,000',
  '1,00,001 – 5,00,000',
  '5,00,001+',
];

// Document types from the "Logic and Pricing" sheet (exact names)
export const ROI_DOCUMENT_TYPES = [
  'Bank Cheques',
  'Bank Documents',
  'ID Cards',
  'KYC Documents',
  'Invoices',
  'Bill of Lading',
  'Packing List',
  'Purchase Orders',
  'Contract',
  'P&L Statements',
  'Cashflow Statement',
  'Trade Finance',
  'Insurance Claims',
  'Loan Applications',
  'Medical Records',
] as const;

export const FOOTER_LINK_GROUPS = [
  {
    title: 'Industries',
    links: ['BFSI', 'Healthcare', 'Telecom', 'Manufacturing'],
  },
  {
    title: 'Resources',
    links: ['Blog', 'Guides', 'Newsroom', 'API Documentation', 'Product Documentation'],
  },
  {
    title: 'Tools',
    links: ['Compress PDF', 'Merge PDF', 'PDF to Image'],
  },
  {
    title: 'Capabilities',
    links: ['Document Processing', 'Document Interpretation', 'Document Extraction', 'Straight Through Protocol (STP)'],
  },
  {
    title: 'Company',
    links: ['About', 'Contact', 'Careers'],
  },
];

export const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com',
  'hotmail.in', 'icloud.com', 'protonmail.com', 'proton.me',
  'rediffmail.com', 'live.com', 'msn.com', 'aol.com', 'ymail.com',
  'zoho.com', 'mail.com', 'inbox.com', 'fastmail.com', 'tutanota.com',
  'gmx.com', 'yandex.com', 'yandex.ru', 'qq.com', '163.com',
];
