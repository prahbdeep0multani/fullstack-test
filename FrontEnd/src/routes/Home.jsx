import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Skeleton } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import EntryChart from '../components/entries/EntryChart';
import AuthContext from '../helpers/core/AuthContext';
import useEntries from '../hooks/useEntries';
import {
  EYEBROW,
  EYEBROW_SM,
  HERO_NUMBER,
  PAGE,
  PILL_ACTIVE,
  PILL_BASE,
  PILL_INACTIVE,
  SUB_NUMBER,
  fmtCents
} from '../helpers/editorial';

const DATE_PRESETS = [
  { label: 'lastWeek', days: 7 },
  { label: 'lastMonth', days: 30 },
  { label: 'lastQuarter', days: 90 },
  { label: 'lastYear', days: 365 }
];

const getDateFrom = preset => {
  const found = DATE_PRESETS.find(p => p.label === preset);
  return found ? dayjs().subtract(found.days, 'day').toISOString() : undefined;
};

const CATCHPHRASES = ['home.catchphrase1', 'home.catchphrase2', 'home.catchphrase3'];

const Home = () => {
  const { t } = useTranslation();
  const { logged } = useContext(AuthContext);
  const { fetchEntries } = useEntries();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [datePreset, setDatePreset] = useState('lastMonth');

  const load = useCallback(
    preset => {
      if (!logged?.company?.id) return;
      setLoading(true);
      const params = { sorter: '-date' };
      if (preset) params.dateFrom = getDateFrom(preset);
      fetchEntries(params)
        .then(data => {
          setEntries(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [fetchEntries, logged]
  );

  useEffect(() => {
    load(datePreset);
  }, [load, datePreset]);

  const totals = useMemo(() => {
    const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  }, [entries]);

  const recent = useMemo(() => entries.slice(0, 6), [entries]);
  const isPositive = totals.balance >= 0;
  const catchphrase = t(CATCHPHRASES[dayjs().date() % CATCHPHRASES.length]);

  const periodOptions = [
    { label: t('entries.allTime'), value: '' },
    ...DATE_PRESETS.map(p => ({ label: t(`entries.${p.label}`), value: p.label }))
  ];

  const renderPill = ({ label, value }) => {
    const active = (datePreset || '') === value;
    return (
      <button
        type="button"
        key={value || 'all'}
        onClick={() => setDatePreset(value || null)}
        className={`${PILL_BASE} ${active ? PILL_ACTIVE : PILL_INACTIVE}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className={`${PAGE} max-w-[860px]`}>
      {/* ── Header ── */}
      <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className={`${EYEBROW} mb-1.5`}>{dayjs().format('dddd, D MMMM YYYY')}</div>
          <div className="text-ink font-serif text-[26px] font-normal leading-tight">
            {t('home.greeting', { name: logged?.name ? `, ${logged.name}` : '' })}
          </div>
          <div className="text-ink-2 mt-1 font-serif text-[13px] italic">{catchphrase}</div>
        </div>

        <div className="flex flex-wrap justify-end gap-1.5">{periodOptions.map(renderPill)}</div>
      </div>

      {/* ── Balance hero ── */}
      <div className="border-edge-2 mb-9 border-b pb-8">
        <div className={`${EYEBROW} mb-2.5`}>{t('entries.balance')}</div>

        {loading ? (
          <Skeleton.Input active size="large" className="!h-16 !w-[300px]" />
        ) : (
          <div className={`${HERO_NUMBER} ${isPositive ? 'text-income' : 'text-expense'}`}>
            {isPositive ? '+' : '−'} €{fmtCents(totals.balance)}
          </div>
        )}

        {/* Income / Expense split */}
        <div className="mt-5 flex flex-wrap items-stretch gap-6">
          <div>
            <div className={`${EYEBROW_SM} mb-1`}>↑ {t('entries.totalIncome')}</div>
            {loading ? (
              <Skeleton.Input active size="small" className="!w-[100px]" />
            ) : (
              <div className={`${SUB_NUMBER} text-income`}>€{fmtCents(totals.totalIncome)}</div>
            )}
          </div>

          <div className="bg-edge-2 w-px self-stretch" />

          <div>
            <div className={`${EYEBROW_SM} mb-1`}>↓ {t('entries.totalExpenses')}</div>
            {loading ? (
              <Skeleton.Input active size="small" className="!w-[100px]" />
            ) : (
              <div className={`${SUB_NUMBER} text-expense`}>€{fmtCents(totals.totalExpenses)}</div>
            )}
          </div>

          {/* Proportion bar */}
          {!loading && totals.totalIncome + totals.totalExpenses > 0 && (
            <div className="flex min-w-[80px] flex-1 items-end">
              <div className="bg-fill-2 h-[3px] w-full overflow-hidden rounded-sm">
                <div
                  className="h-full rounded-sm bg-gradient-to-r from-[#15803d] to-[#22c55e] transition-[width] duration-700 ease-out"
                  style={{
                    width: `${(totals.totalIncome / (totals.totalIncome + totals.totalExpenses)) * 100}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="mb-9">
        <div className={`${EYEBROW_SM} mb-3`}>{t('entries.chartTitle')}</div>
        <EntryChart entries={entries} />
      </div>

      {/* ── Recent transactions ── */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <div className={EYEBROW_SM}>{t('home.recentEntries')}</div>
          <Button
            type="link"
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/entries')}
            className="!h-auto !p-0 !font-sans !text-[11px]"
          >
            {t('common.details')}
          </Button>
        </div>

        {loading && (
          <div className="flex flex-col gap-3.5">
            {[1, 2, 3].map(n => (
              <Skeleton key={n} active avatar={{ size: 8 }} title={false} paragraph={{ rows: 1 }} />
            ))}
          </div>
        )}

        {!loading && recent.length === 0 && (
          <div className="text-ink-3 py-8 text-center font-serif text-[13px] italic">{t('entries.noEntries')}</div>
        )}

        {!loading &&
          recent.map((item, i) => {
            const isIncome = item.type === 'income';
            const last = i === recent.length - 1;
            return (
              <div
                key={item._id}
                className={`flex items-center justify-between py-3.5 ${last ? '' : 'border-edge-2 border-b'}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                      isIncome ? 'bg-income' : 'bg-expense'
                    }`}
                  />
                  <div>
                    <div className="text-ink text-sm">{item.description || '—'}</div>
                    {item.category && (
                      <div className="text-ink-3 mt-0.5 text-[10px] uppercase tracking-[0.08em]">{item.category}</div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-serif text-[17px] font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
                    {isIncome ? '+' : '−'} €{fmtCents(item.amount)}
                  </div>
                  <div className="text-ink-3 mt-0.5 text-[10px] tracking-wide">{dayjs(item.date).format('D MMM')}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Home;
