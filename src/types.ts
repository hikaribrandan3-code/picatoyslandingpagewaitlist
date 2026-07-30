export interface YoyoEdition {
  id: string;
  name: string;
  coreColor: string;
  accentColor: string;
  price: number;
  originalPrice: number;
  inStock: boolean;
  stockLeft: number;
  image: string;
  description: string;
  specs: {
    weight: string;
    diameter: string;
    width: string;
    bearing: string;
    material: string;
    spinTime: string;
  };
}

export interface ReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verifiedBuyer: boolean;
  trickLevel: 'Beginner' | 'Intermediate' | 'Pro Tricker' | 'Collector';
  helpfulCount: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Specs' | 'Shipping' | 'Grinder Mechanism';
}

export interface MysteryBoxItem {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Legendary';
  description: string;
  iconName: string;
  color: string;
}

export interface CartItem {
  edition: YoyoEdition;
  selectedCoreColor: string;
  quantity: number;
  addMysteryPack: boolean;
  addProStrings: boolean;
}

export interface VipTicket {
  email: string;
  ticketNumber: string;
  tier: string;
  timestamp: string;
}
