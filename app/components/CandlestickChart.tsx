'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
}

// Type guard for chart data
function isValidData(data: any): boolean {
  return Array.isArray(data) && data.length > 0 && 
         data.every(item => item && typeof item.time === 'number' && 
                    typeof item.open === 'number' && 
                    typeof item.high === 'number' && 
                    typeof item.low === 'number' && 
                    typeof item.close === 'number');
}

export default function CandlestickChart({ data }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { color: '#f3f4f6' },
        horzLines: { color: '#f3f4f6' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#e5e7eb',
      },
      rightPriceScale: {
        borderColor: '#e5e7eb',
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(data as any);

    // Fit content to display all data
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} className="w-full" />;
}

