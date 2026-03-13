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
import { LoadingSkeleton } from '@/components/ui/Spinner';
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

export default function PriceChart({
  symbol,
  assetClass = 'crypto',
  coinId,
  height = 360,
  defaultRange = '1M',
  showToolbar = true,
}: Props) {
  const { resolvedTheme } = useTheme();
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

  const dark = resolvedTheme === 'dark';

  const colors = {
    bg: dark ? '#161616' : '#ffffff',
    grid: dark ? '#1e1e1e' : '#f0f0f0',
    text: dark ? '#888888' : '#737373',
    border: dark ? '#262626' : '#e0e0e0',
    up: dark ? '#22c55e' : '#16a34a',
    down: dark ? '#ef4444' : '#dc2626',
    area: dark ? 'rgba(59,130,246,0.12)' : 'rgba(29,78,216,0.08)',
    line: dark ? '#3b82f6' : '#1d4ed8',
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.bg },
        textColor: colors.text,
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: colors.border, width: 1, style: 3 },
        horzLine: { color: colors.border, width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: colors.border,
        textColor: colors.text,
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    chart.applyOptions({ width: containerRef.current.clientWidth, height });
    chartRef.current = chart;

    const observer = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark, height]);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    if (chartType === 'candle') {
      const series = chartRef.current.addSeries(CandlestickSeries, {
        upColor: colors.up,
        downColor: colors.down,
        borderUpColor: colors.up,
        borderDownColor: colors.down,
        wickUpColor: colors.up,
        wickDownColor: colors.down,
      });
      const sorted = [...data].sort((a, b) => a.time - b.time);
      series.setData(sorted.map((d) => ({ time: d.time as unknown as string, open: d.open, high: d.high, low: d.low, close: d.close })));
      seriesRef.current = series as unknown as ISeriesApi<'Candlestick'>;
    } else if (chartType === 'area') {
      const series = chartRef.current.addSeries(AreaSeries, {
        lineColor: colors.line,
        topColor: colors.area,
        bottomColor: 'transparent',
        lineWidth: 2,
      });
      const sorted = [...data].sort((a, b) => a.time - b.time);
      series.setData(sorted.map((d) => ({ time: d.time as unknown as string, value: d.close })));
      seriesRef.current = series as unknown as ISeriesApi<'Area'>;
    } else {
      const series = chartRef.current.addSeries(LineSeries, {
        color: colors.line,
        lineWidth: 2,
      });
      const sorted = [...data].sort((a, b) => a.time - b.time);
      series.setData(sorted.map((d) => ({ time: d.time as unknown as string, value: d.close })));
      seriesRef.current = series as unknown as ISeriesApi<'Line'>;
    }

    chartRef.current.timeScale().fitContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, chartType, dark]);

  return (
    <div>
      {showToolbar && (
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-1">
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
        <div className="w-full animate-pulse rounded" style={{ height, background: 'var(--surface-2)' }} />
      )}
      <div ref={containerRef} className="chart-container" />
    </div>
  );
}
