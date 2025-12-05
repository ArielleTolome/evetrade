import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const CandlestickChart = ({ data, width = 800, height = 400, period: initialPeriod = '1D', showVolume = true, onPeriodChange }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [period, setPeriod] = useState(initialPeriod);

  const periods = ['1H', '4H', '1D', '1W'];
  const isLoading = data.length === 0;

  useEffect(() => {
    if (isLoading || !chartContainerRef.current) {
      return;
    }

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width,
        height,
        layout: {
          background: { color: 'transparent' },
          textColor: '#778DA9',
        },
        grid: {
          vertLines: { color: '#1B263B' },
          horzLines: { color: '#1B263B' },
        },
        crosshair: {
          mode: 'normal',
        },
        timeScale: {
          borderColor: '#1B263B',
        },
        rightPriceScale: {
          borderColor: '#1B263B',
        },
      });
      chartRef.current = chart;

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00ff9d',
        downColor: '#d73000',
        borderVisible: false,
        wickUpColor: '#00ff9d',
        wickDownColor: '#d73000',
      });
      candlestickSeriesRef.current = candlestickSeries;

      if (showVolume) {
        const volumeSeries = chart.addHistogramSeries({
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });
        volumeSeriesRef.current = volumeSeries;
      }
    }

    candlestickSeriesRef.current.setData(data.map(item => ({ ...item, time: item.timestamp })));

    if (showVolume && volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(
        data.map(item => ({
          time: item.timestamp,
          value: item.volume || 0,
          color: item.close > item.open ? 'rgba(0, 255, 157, 0.5)' : 'rgba(215, 48, 0, 0.5)',
        }))
      );
    }
    chartRef.current.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chartRef.current.resize(width, height);
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, width, height, showVolume, isLoading]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-space-dark/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-accent-cyan" size={48} />
            <p className="mt-4 text-text-secondary">Loading price history...</p>
          </div>
        </div>
      )}
      <div className="absolute top-2 left-2 z-10 flex space-x-1 bg-space-dark/50 p-1 rounded-md">
        {periods.map(p => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              period === p
                ? 'bg-accent-cyan text-space-dark font-semibold'
                : 'text-text-secondary hover:bg-space-light/50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} className="candlestick-chart" style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

CandlestickChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      open: PropTypes.number.isRequired,
      high: PropTypes.number.isRequired,
      low: PropTypes.number.isRequired,
      close: PropTypes.number.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      volume: PropTypes.number,
    })
  ).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  period: PropTypes.string,
  showVolume: PropTypes.bool,
  onPeriodChange: PropTypes.func,
};

export default CandlestickChart;
