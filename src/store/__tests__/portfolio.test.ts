import { describe, it, expect, beforeEach } from 'vitest';
import { usePortfolioStore } from '../portfolio';

const SAMPLE_HOLDING = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  assetClass: 'stock',
  quantity: 10,
  avgBuyPrice: 175.5,
  buyDate: '2024-01-15',
  currency: 'USD',
};

const SAMPLE_ALERT = {
  symbol: 'BTC',
  type: 'price_above' as const,
  threshold: 100000,
  active: true,
};

describe('PortfolioStore — Holdings', () => {
  beforeEach(() => {
    usePortfolioStore.setState({ holdings: [], alerts: [] });
  });

  it('starts empty when reset', () => {
    expect(usePortfolioStore.getState().holdings).toHaveLength(0);
  });

  it('adds a holding with generated id', () => {
    usePortfolioStore.getState().addHolding(SAMPLE_HOLDING);
    const { holdings } = usePortfolioStore.getState();
    expect(holdings).toHaveLength(1);
    expect(holdings[0].id).toBeDefined();
    expect(holdings[0].symbol).toBe('AAPL');
  });

  it('adds multiple holdings', () => {
    usePortfolioStore.getState().addHolding(SAMPLE_HOLDING);
    usePortfolioStore.getState().addHolding({ ...SAMPLE_HOLDING, symbol: 'MSFT' });
    expect(usePortfolioStore.getState().holdings).toHaveLength(2);
  });

  it('generates unique ids for each holding', () => {
    usePortfolioStore.getState().addHolding(SAMPLE_HOLDING);
    usePortfolioStore.getState().addHolding(SAMPLE_HOLDING);
    const ids = usePortfolioStore.getState().holdings.map((h) => h.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('updates a holding', () => {
    usePortfolioStore.getState().addHolding(SAMPLE_HOLDING);
    const id = usePortfolioStore.getState().holdings[0].id;
    usePortfolioStore.getState().updateHolding(id, { quantity: 20 });
    expect(usePortfolioStore.getState().holdings[0].quantity).toBe(20);
  });

  it('does not affect other holdings on update', () => {
    usePortfolioStore.getState().addHolding(SAMPLE_HOLDING);
    usePortfolioStore.getState().addHolding({ ...SAMPLE_HOLDING, symbol: 'MSFT' });
    const id = usePortfolioStore.getState().holdings[0].id;
    usePortfolioStore.getState().updateHolding(id, { quantity: 99 });
    expect(usePortfolioStore.getState().holdings[1].symbol).toBe('MSFT');
    expect(usePortfolioStore.getState().holdings[1].quantity).toBe(10);
  });

  it('removes a holding by id', () => {
    usePortfolioStore.getState().addHolding(SAMPLE_HOLDING);
    const id = usePortfolioStore.getState().holdings[0].id;
    usePortfolioStore.getState().removeHolding(id);
    expect(usePortfolioStore.getState().holdings).toHaveLength(0);
  });

  it('removing a non-existent id does nothing', () => {
    usePortfolioStore.getState().addHolding(SAMPLE_HOLDING);
    usePortfolioStore.getState().removeHolding('ghost-id-xyz');
    expect(usePortfolioStore.getState().holdings).toHaveLength(1);
  });
});

describe('PortfolioStore — Alerts', () => {
  beforeEach(() => {
    usePortfolioStore.setState({ holdings: [], alerts: [] });
  });

  it('adds an alert with id and createdAt', () => {
    usePortfolioStore.getState().addAlert(SAMPLE_ALERT);
    const { alerts } = usePortfolioStore.getState();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].id).toBeDefined();
    expect(alerts[0].createdAt).toBeDefined();
    expect(alerts[0].symbol).toBe('BTC');
    expect(alerts[0].threshold).toBe(100000);
  });

  it('removes an alert by id', () => {
    usePortfolioStore.getState().addAlert(SAMPLE_ALERT);
    const id = usePortfolioStore.getState().alerts[0].id;
    usePortfolioStore.getState().removeAlert(id);
    expect(usePortfolioStore.getState().alerts).toHaveLength(0);
  });

  it('toggles alert active state', () => {
    usePortfolioStore.getState().addAlert(SAMPLE_ALERT);
    const id = usePortfolioStore.getState().alerts[0].id;
    expect(usePortfolioStore.getState().alerts[0].active).toBe(true);
    usePortfolioStore.getState().toggleAlert(id);
    expect(usePortfolioStore.getState().alerts[0].active).toBe(false);
    usePortfolioStore.getState().toggleAlert(id);
    expect(usePortfolioStore.getState().alerts[0].active).toBe(true);
  });

  it('supports multiple alert types', () => {
    usePortfolioStore.getState().addAlert({ ...SAMPLE_ALERT, type: 'price_below', threshold: 20000 });
    usePortfolioStore.getState().addAlert({ ...SAMPLE_ALERT, type: 'change_pct', threshold: 10 });
    const alerts = usePortfolioStore.getState().alerts;
    expect(alerts.map((a) => a.type)).toContain('price_below');
    expect(alerts.map((a) => a.type)).toContain('change_pct');
  });
});
