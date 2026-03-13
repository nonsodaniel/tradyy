import { describe, it, expect } from 'vitest';
import { getMockNews } from '../api/news';

describe('getMockNews', () => {
  it('returns requested number of articles', () => {
    expect(getMockNews(5)).toHaveLength(5);
    expect(getMockNews(10)).toHaveLength(10);
  });

  it('returns at most all available articles', () => {
    const all = getMockNews(100);
    expect(all.length).toBeGreaterThan(0);
    expect(all.length).toBeLessThanOrEqual(100);
  });

  it('each article has required fields', () => {
    const articles = getMockNews(5);
    for (const a of articles) {
      expect(a.id).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.summary).toBeTruthy();
      expect(a.source).toBeTruthy();
      expect(a.publishedAt).toBeTruthy();
      expect(['bullish', 'bearish', 'neutral']).toContain(a.sentiment);
      expect(Array.isArray(a.relatedSymbols)).toBe(true);
    }
  });

  it('article ids are unique', () => {
    const articles = getMockNews(12);
    const ids = articles.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('publishedAt dates are valid ISO strings', () => {
    const articles = getMockNews(5);
    for (const a of articles) {
      const d = new Date(a.publishedAt);
      expect(d.getTime()).not.toBeNaN();
    }
  });

  it('has a mix of sentiments across articles', () => {
    const articles = getMockNews(12);
    const sentiments = new Set(articles.map((a) => a.sentiment));
    expect(sentiments.size).toBeGreaterThan(1);
  });
});
