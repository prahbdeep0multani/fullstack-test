import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

// SVG-only token references — Tailwind classes can't drive SVG attributes,
// so we read CSS vars directly via getComputedStyle at render time isn't ideal.
// Instead we hardcode the editorial neutral palette here.
const GRID_LIGHT = 'rgba(0,0,0,0.06)';
const GRID_DARK = 'rgba(255,255,255,0.06)';
const LABEL_LIGHT = 'rgba(0,0,0,0.45)';
const LABEL_DARK = 'rgba(255,255,255,0.45)';

const W = 600;
const H = 160;
const PAD_X = 8;
const PAD_Y = 16;
const CHART_H = H - PAD_Y * 2;

const smoothLine = pts => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const cpX = (pts[i].x + pts[i + 1].x) / 2;
    d += ` C ${cpX} ${pts[i].y} ${cpX} ${pts[i + 1].y} ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
};

const areaPath = (line, pts) => {
  if (!line) return '';
  return `${line} L ${pts[pts.length - 1].x} ${H - PAD_Y} L ${pts[0].x} ${H - PAD_Y} Z`;
};

const EntryChart = ({ entries }) => {
  const { t } = useTranslation();
  const isDark = typeof document !== 'undefined' && document.body.classList.contains('dark');
  const gridColor = isDark ? GRID_DARK : GRID_LIGHT;
  const labelColor = isDark ? LABEL_DARK : LABEL_LIGHT;

  const months = useMemo(() => {
    const buckets = {};
    for (let i = 5; i >= 0; i -= 1) {
      const key = dayjs().subtract(i, 'month').format('YYYY-MM');
      buckets[key] = { income: 0, expense: 0 };
    }
    entries.forEach(e => {
      const key = dayjs(e.date).format('YYYY-MM');
      if (buckets[key]) {
        if (e.type === 'income') buckets[key].income += e.amount;
        else buckets[key].expense += e.amount;
      }
    });
    return Object.entries(buckets).map(([key, val]) => ({
      label: dayjs(key).format('MMM'),
      income: val.income / 100,
      expense: val.expense / 100
    }));
  }, [entries]);

  const maxVal = Math.max(...months.flatMap(m => [m.income, m.expense]), 1);
  const xStep = (W - PAD_X * 2) / (months.length - 1);

  const toCoords = key =>
    months.map((m, i) => ({
      x: PAD_X + i * xStep,
      y: PAD_Y + CHART_H - (m[key] / maxVal) * CHART_H
    }));

  const incomeCoords = toCoords('income');
  const expenseCoords = toCoords('expense');
  const incomeLine = smoothLine(incomeCoords);
  const expenseLine = smoothLine(expenseCoords);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-label={t('entries.chartTitle')}>
        <defs>
          <linearGradient id="grad-income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad-expense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle grid */}
        {[0.25, 0.5, 0.75].map(frac => (
          <line
            key={frac}
            x1={PAD_X}
            y1={PAD_Y + CHART_H * (1 - frac)}
            x2={W - PAD_X}
            y2={PAD_Y + CHART_H * (1 - frac)}
            stroke={gridColor}
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}

        {/* Income area + line */}
        <path d={areaPath(incomeLine, incomeCoords)} fill="url(#grad-income)" />
        <path
          d={incomeLine}
          fill="none"
          stroke="#22c55e"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Expense area + line */}
        <path d={areaPath(expenseLine, expenseCoords)} fill="url(#grad-expense)" />
        <path
          d={expenseLine}
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {incomeCoords.map((p, i) => (
          <circle key={`inc-${months[i].label}`} cx={p.x} cy={p.y} r="2.5" fill="#22c55e" />
        ))}
        {expenseCoords.map((p, i) => (
          <circle key={`exp-${months[i].label}`} cx={p.x} cy={p.y} r="2.5" fill="#ef4444" />
        ))}

        {/* Month labels */}
        {months.map(({ label }, i) => (
          <text
            key={`lbl-${label}`}
            x={PAD_X + i * xStep}
            y={H - 2}
            textAnchor="middle"
            fontSize="9"
            fill={labelColor}
            fontFamily="'IBM Plex Sans', system-ui, sans-serif"
            letterSpacing="0.05em"
          >
            {label.toUpperCase()}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-1.5 flex gap-5 font-sans">
        <span className="text-ink-2 flex items-center gap-1.5 text-[11px]">
          <span className="bg-income-soft inline-block h-0.5 w-5 rounded-sm" />
          {t('entries.income')}
        </span>
        <span className="text-ink-2 flex items-center gap-1.5 text-[11px]">
          <span className="bg-expense-soft inline-block h-0.5 w-5 rounded-sm" />
          {t('entries.expense')}
        </span>
      </div>
    </div>
  );
};

export default EntryChart;
