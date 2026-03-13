import { describe, it, expect, beforeEach } from 'vitest';
import { useWatchlistStore } from '../watchlist';

describe('WatchlistStore', () => {
  beforeEach(() => {
    useWatchlistStore.setState({
      symbols: ['BTC', 'ETH', 'AAPL'],
    });
  });

  it('initialises with default symbols', () => {
    const { symbols } = useWatchlistStore.getState();
    expect(symbols).toContain('BTC');
    expect(symbols).toContain('ETH');
    expect(symbols).toContain('AAPL');
  });

  it('adds a new symbol', () => {
    useWatchlistStore.getState().add('MSFT');
    expect(useWatchlistStore.getState().symbols).toContain('MSFT');
  });

  it('does not add duplicate symbols', () => {
    useWatchlistStore.getState().add('BTC');
    const { symbols } = useWatchlistStore.getState();
    expect(symbols.filter((s) => s === 'BTC').length).toBe(1);
  });

  it('removes a symbol', () => {
    useWatchlistStore.getState().remove('ETH');
    expect(useWatchlistStore.getState().symbols).not.toContain('ETH');
  });

  it('toggle adds a symbol not present', () => {
    useWatchlistStore.getState().toggle('SOL');
    expect(useWatchlistStore.getState().symbols).toContain('SOL');
  });

  it('toggle removes a symbol already present', () => {
    useWatchlistStore.getState().toggle('BTC');
    expect(useWatchlistStore.getState().symbols).not.toContain('BTC');
  });

  it('has() returns true for existing symbol', () => {
    expect(useWatchlistStore.getState().has('AAPL')).toBe(true);
  });

  it('has() returns false for missing symbol', () => {
    expect(useWatchlistStore.getState().has('DOGE')).toBe(false);
  });

  it('clears all symbols', () => {
    useWatchlistStore.getState().clear();
    expect(useWatchlistStore.getState().symbols).toHaveLength(0);
  });
});
