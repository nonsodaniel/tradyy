import { describe, it, expect } from 'vitest';
import { SUPPORTED_CURRENCIES, getCurrencyByCode } from '../../types/currency';

describe('SUPPORTED_CURRENCIES', () => {
  it('contains at least 30 currencies', () => {
    expect(SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(30);
  });

  it('every currency has required fields', () => {
    for (const c of SUPPORTED_CURRENCIES) {
      expect(c.code).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.symbol).toBeTruthy();
      expect(c.locale).toBeTruthy();
    }
  });

  it('all currency codes are unique', () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it('contains major world currencies', () => {
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(codes).toContain('USD');
    expect(codes).toContain('EUR');
    expect(codes).toContain('GBP');
    expect(codes).toContain('JPY');
    expect(codes).toContain('CNY');
    expect(codes).toContain('INR');
    expect(codes).toContain('NGN');
    expect(codes).toContain('BRL');
  });

  it('all locales are valid BCP-47 locale strings', () => {
    for (const c of SUPPORTED_CURRENCIES) {
      // A valid locale won't throw in Intl.NumberFormat
      expect(() => new Intl.NumberFormat(c.locale)).not.toThrow();
    }
  });
});

describe('getCurrencyByCode', () => {
  it('returns correct currency for known code', () => {
    const usd = getCurrencyByCode('USD');
    expect(usd).toBeDefined();
    expect(usd!.symbol).toBe('$');
    expect(usd!.name).toBe('US Dollar');
  });

  it('returns undefined for unknown code', () => {
    expect(getCurrencyByCode('XYZ')).toBeUndefined();
  });

  it('is case-sensitive', () => {
    expect(getCurrencyByCode('usd')).toBeUndefined();
    expect(getCurrencyByCode('USD')).toBeDefined();
  });

  it('returns EUR correctly', () => {
    const eur = getCurrencyByCode('EUR');
    expect(eur).toBeDefined();
    expect(eur!.symbol).toBe('€');
  });
});
