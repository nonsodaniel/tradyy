export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  assetClass: string;
  quantity: number;
  avgBuyPrice: number;
  buyDate: string;
  currency: string;
  notes?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPct: number;
  dayChange: number;
  dayChangePct: number;
  currency: string;
}

export interface AlertRule {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'change_pct';
  threshold: number;
  active: boolean;
  createdAt: string;
  triggeredAt?: string;
}
