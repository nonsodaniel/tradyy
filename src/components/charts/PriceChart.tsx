'use client';
import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  AreaSeries,
  LineSeries,
} from 'lightweight-charts';
import { useTheme } from 'next-themes';
import useSWR from 'swr';
import { CHART_INTERVALS } from '@/types/asset';
import type { OHLCVData } from '@/types/asset';
import clsx from 'clsx';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  symbol: string;
  assetClass?: string;
  coinId?: string;
  height?: number;
  defaultRange?: string;
  showToolbar?: boolean;
}

type ChartType = 'candle' | 'area' | 'line';

function getColors(dark: boolean) {
  return {
    bg:     dark ? '#161616' : '#ffffff',
    grid:   dark ? '#1e1e1e' : '#f0f0f0',
    text:   dark ? '#888888' : '#737373',
    border: dark ? '#262626' : '#e0e0e0',
    up:     dark ? '#22c55e' : '#16a34a',
    down:   dark ? '#ef4444' : '#dc2626',
    area:   dark ? 'rgba(59,130,246,0.12)' : 'rgba(29,78,216,0.08)',
    line:   dark ? '#3b82f6' : '#1d4ed8',
  };
}

export default function PriceChart({
  symbol,
  assetClass = 'crypto',
  coinId,
  height = 360,
  defaultRange = '1M',
  showToolbar = true,
}: Props) {
  const { resolvedTheme } = useTheme();
  // Default to dark so first render matches the defaultTheme="dark" in layout
  const dark = resolvedTheme ? resolvedTheme === 'dark' : true;

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | ISeriesApi<'Line'> | null>(null);

  const [range, setRange] = useState(defaultRange);
  const [chartType, setChartType] = useState<ChartType>('area');

  const id = coinId || symbol.toLowerCase();
  const { data, isLoading } = useSWR<OHLCVData[]>(
    `/api/chart?symbol=${symbol}&range=${range}&type=${assetClass}&id=${id}`,
    fetcher,
    { refreshInterval: 60_000, keepPreviousData: true }
  );

  // ── Effect 1: create chart once on mount / height change only ─────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const c = getColors(dark);
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: c.bg },
        textColor: c.text,
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: c.grid },
        horzLines: { color: c.grid },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: c.border, width: 1, style: 3 },
        horzLine: { color: c.border, width: 1, style: 3 },
      },
      rightPriceScale: { borderColor: c.border, textColor: c.text },
      timeScale: { borderColor: c.border, timeVisible: true, secondsVisible: false },
      handleScroll: true,
      handleScale: true,
      width: containerRef.current.clientWidth,
      height,
    });

    chartRef.current = chart;

    const observer = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      // Null the series ref first so Effect 3 doesn't try to remove it from
      // a chart that no longer exists.
      seriesRef.current = null;
      chart.remove();
      chartRef.current = null;
    };
    // Only recreate when height changes — theme changes are handled by Effect 2
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  // ── Effect 2: update chart colours when theme changes (no recreation) ─────
  useEffect(() => {
    if (!chartRef.current) return;
    const c = getColors(dark);

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: c.bg },
        textColor: c.text,
      },
      grid: {
        vertLines: { color: c.grid },
        horzLines: { color: c.grid },
      },
      crosshair: {
        vertLine: { color: c.border },
        horzLine: { color: c.border },
      },
      rightPriceScale: { borderColor: c.border, textColor: c.text },
      timeScale: { borderColor: c.border },
    });

    // Update existing series colours if present
    if (seriesRef.current) {
      const c2 = getColors(dark);
      if (chartType === 'candle') {
        (seriesRef.current as ISeriesApi<'Candlestick'>).applyOptions({
          upColor: c2.up, downColor: c2.down,
          borderUpColor: c2.up, borderDownColor: c2.down,
          wickUpColor: c2.up, wickDownColor: c2.down,
        });
      } else if (chartType === 'area') {
        (seriesRef.current as ISeriesApi<'Area'>).applyOptions({
          lineColor: c2.line, topColor: c2.area,
        });
      } else {
        (seriesRef.current as ISeriesApi<'Line'>).applyOptions({
          color: c2.line,
        });
      }
    }
  }, [dark, chartType]);

  // ── Effect 3: set / replace series data when data or chartType changes ────
  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    const c = getColors(dark);
    const sorted = [...data].sort((a, b) => a.time - b.time);

    // Remove old series safely
    if (seriesRef.current) {
      try {
        chartRef.current.removeSeries(seriesRef.current);
      } catch {
        // chart may have been recreated; safe to ignore
      }
      seriesRef.current = null;
    }

    if (chartType === 'candle') {
      const s = chartRef.current.addSeries(CandlestickSeries, {
        upColor: c.up, downColor: c.down,
        borderUpColor: c.up, borderDownColor: c.down,
        wickUpColor: c.up, wickDownColor: c.down,
      });
      s.setData(sorted.map((d) => ({
        time: d.time as unknown as string,
        open: d.open, high: d.high, low: d.low, close: d.close,
      })));
      seriesRef.current = s as unknown as ISeriesApi<'Candlestick'>;
    } else if (chartType === 'area') {
      const s = chartRef.current.addSeries(AreaSeries, {
        lineColor: c.line, topColor: c.area,
        bottomColor: 'transparent', lineWidth: 2,
      });
      s.setData(sorted.map((d) => ({ time: d.time as unknown as string, value: d.close })));
      seriesRef.current = s as unknown as ISeriesApi<'Area'>;
    } else {
      const s = chartRef.current.addSeries(LineSeries, {
        color: c.line, lineWidth: 2,
      });
      s.setData(sorted.map((d) => ({ time: d.time as unknown as string, value: d.close })));
      seriesRef.current = s as unknown as ISeriesApi<'Line'>;
    }

    chartRef.current.timeScale().fitContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chartType]);

  return (
    <div>
      {showToolbar && (
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {CHART_INTERVALS.map((i) => (
              <button
                key={i.value}
                onClick={() => setRange(i.value)}
                className={clsx(
                  'text-xs px-2 py-1 rounded transition-fast font-medium',
                  range === i.value
                    ? 'bg-[var(--surface-2)] text-[var(--foreground)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                )}
              >
                {i.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(['area', 'candle', 'line'] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={clsx(
                  'text-xs px-2 py-1 rounded capitalize transition-fast',
                  chartType === t
                    ? 'bg-[var(--surface-2)] text-[var(--foreground)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)]'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading && !data && (
        <div
          className="w-full animate-pulse rounded"
          style={{ height, background: 'var(--surface-2)' }}
        />
      )}
      <div ref={containerRef} className="chart-container" />
    </div>
  );
}
