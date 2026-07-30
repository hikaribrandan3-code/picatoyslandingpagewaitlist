export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Specs' | 'Shipping' | 'Grinder Mechanism';
}

export interface ColorOption {
  id: string;
  name: string;
  swatch: string;
}

export interface VipTicket {
  email: string;
  ticketNumber: string;
  colorPreference: string;
  timestamp: string;
}
