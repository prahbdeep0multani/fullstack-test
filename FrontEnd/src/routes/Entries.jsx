import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Popconfirm, Table, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import EntryForm from '../components/entries/EntryForm';
import MessageContext from '../helpers/core/MessageContext';
import useEntries from '../hooks/useEntries';
import AppContext from '../helpers/AppContext';
import {
  EYEBROW,
  EYEBROW_SM,
  PAGE,
  PAGE_MOBILE,
  PAGE_TITLE,
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

const Entries = () => {
  const { t } = useTranslation();
  const { isMobile } = useContext(AppContext);
  const { loadingMsg, savedMsg, errorMsg } = useContext(MessageContext);
  const { fetchEntries, createEntry, updateEntry, deleteEntry } = useEntries();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [datePreset, setDatePreset] = useState(null);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const load = useCallback(() => {
    setLoading(true);
    fetchEntries({
      sorter: '-date',
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(datePreset ? { dateFrom: getDateFrom(datePreset) } : {}),
      ...(search ? { filter: search } : {})
    })
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [fetchEntries, typeFilter, datePreset, search]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const totals = useMemo(() => {
    const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  }, [entries]);

  const categories = useMemo(() => [...new Set(entries.map(e => e.category).filter(Boolean))], [entries]);

  const handleAdd = () => {
    setSelectedEntry(null);
    setModalOpen(true);
  };

  const handleEdit = record => {
    setSelectedEntry(record);
    setModalOpen(true);
  };

  const handleDelete = record => {
    const msg = loadingMsg();
    return deleteEntry(record._id)
      .then(() => {
        savedMsg(msg);
        refresh();
      })
      .catch(err => errorMsg(msg, err));
  };

  const handleSave = payload => {
    const msg = loadingMsg();
    const op = selectedEntry ? updateEntry(selectedEntry._id, payload) : createEntry(payload);
    return op
      .then(() => {
        savedMsg(msg);
        setModalOpen(false);
        refresh();
      })
      .catch(err => {
        errorMsg(msg, err);
        throw err;
      });
  };

  const renderPill = ({ label, value }, group, onChange) => {
    const active = group === value;
    return (
      <button
        key={value || 'all'}
        type="button"
        onClick={() => onChange(value)}
        className={`${PILL_BASE} ${active ? PILL_ACTIVE : PILL_INACTIVE}`}
      >
        {label}
      </button>
    );
  };

  const periodOptions = [
    { label: t('entries.allTime'), value: '' },
    ...DATE_PRESETS.map(p => ({ label: t(`entries.${p.label}`), value: p.label }))
  ];

  const typeOptions = [
    { label: t('common.type'), value: '' },
    { label: t('entries.income'), value: 'income' },
    { label: t('entries.expense'), value: 'expense' }
  ];

  const eyebrowHeader = label => <span className={EYEBROW_SM}>{label}</span>;

  const columns = [
    {
      title: eyebrowHeader(t('entries.date')),
      dataIndex: 'date',
      key: 'date',
      width: 110,
      render: val => <span className="text-ink-2 font-sans text-xs">{dayjs(val).format('DD MMM YYYY')}</span>
    },
    {
      title: eyebrowHeader(t('common.type')),
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: val => (
        <span
          className={`inline-flex items-center gap-1.5 font-sans text-[11px] font-medium uppercase tracking-[0.06em] ${
            val === 'income' ? 'text-income' : 'text-expense'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${val === 'income' ? 'bg-income' : 'bg-expense'}`} />
          {t(`entries.${val}`)}
        </span>
      )
    },
    {
      title: eyebrowHeader(t('common.description')),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: val => <span className="text-ink font-sans text-sm">{val || '—'}</span>
    },
    {
      title: eyebrowHeader(t('common.category')),
      dataIndex: 'category',
      key: 'category',
      width: 130,
      ellipsis: true,
      render: val =>
        val ? <span className="text-ink-3 font-sans text-[10px] uppercase tracking-[0.08em]">{val}</span> : null
    },
    {
      title: <span className={`${EYEBROW_SM} block text-right`}>{t('entries.amount')}</span>,
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (val, record) => (
        <span
          className={`font-serif text-[17px] font-semibold ${
            record.type === 'income' ? 'text-income' : 'text-expense'
          }`}
        >
          {record.type === 'income' ? '+' : '−'} €{fmtCents(val)}
        </span>
      )
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_, record) => (
        <span className="inline-flex gap-1">
          <Tooltip title={t('common.edit')}>
            <Button type="text" size="small" onClick={() => handleEdit(record)}>
              <span className="text-ink-3 text-[10px] tracking-[0.08em]">EDIT</span>
            </Button>
          </Tooltip>
          <Popconfirm
            title={t('common.sureToDelete')}
            okText={t('common.yes')}
            cancelText={t('common.no')}
            placement="left"
            onConfirm={() => handleDelete(record)}
          >
            <Tooltip title={t('common.delete')}>
              <Button type="text" size="small" danger>
                <span className="text-[10px] tracking-[0.08em]">DEL</span>
              </Button>
            </Tooltip>
          </Popconfirm>
        </span>
      )
    }
  ];

  const isPositive = totals.balance >= 0;

  return (
    <div className={isMobile ? PAGE_MOBILE : PAGE}>
      {/* ── Header ── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className={`${EYEBROW} mb-1.5`}>{t('entries.title')}</div>
          <div className={PAGE_TITLE}>{t('entries.title')}</div>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="!h-10 !font-sans !text-[13px] !tracking-[0.04em]"
        >
          {t('entries.addEntry')}
        </Button>
      </div>

      {/* ── Totals ── */}
      <div className="border-edge-2 mb-7 flex flex-wrap items-end gap-8 border-b pb-7">
        <div>
          <div className={`${EYEBROW_SM} mb-1.5`}>{t('entries.balance')}</div>
          <div
            className={`font-serif text-[clamp(40px,5vw,56px)] font-light leading-none -tracking-[0.02em] ${
              isPositive ? 'text-income' : 'text-expense'
            }`}
          >
            {isPositive ? '+' : '−'} €{fmtCents(totals.balance)}
          </div>
        </div>
        <div className="flex items-end gap-6">
          <div>
            <div className={`${EYEBROW_SM} mb-1`}>↑ {t('entries.totalIncome')}</div>
            <div className={`${SUB_NUMBER} text-income`}>€{fmtCents(totals.totalIncome)}</div>
          </div>
          <div className="bg-edge-2 w-px self-stretch" />
          <div>
            <div className={`${EYEBROW_SM} mb-1`}>↓ {t('entries.totalExpenses')}</div>
            <div className={`${SUB_NUMBER} text-expense`}>€{fmtCents(totals.totalExpenses)}</div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="mb-6 flex flex-col gap-3.5">
        <div>
          <div className={`${EYEBROW_SM} mb-2`}>{t('common.filter')} · period</div>
          <div className="flex flex-wrap gap-1.5">
            {periodOptions.map(opt => renderPill(opt, datePreset || '', v => setDatePreset(v || null)))}
          </div>
        </div>

        <div>
          <div className={`${EYEBROW_SM} mb-2`}>{t('common.type')}</div>
          <div className="flex flex-wrap gap-1.5">
            {typeOptions.map(opt => renderPill(opt, typeFilter || '', v => setTypeFilter(v || null)))}
          </div>
        </div>

        <Input
          allowClear
          prefix={<SearchOutlined className="text-ink-3" />}
          placeholder={t('common.filter')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="!bg-fill !max-w-[360px] !rounded-lg !border-none !font-sans"
        />
      </div>

      {/* ── Table ── */}
      <Table
        dataSource={entries}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false, simple: isMobile }}
        showSorterTooltip={false}
        size="middle"
        className="!bg-transparent !font-sans"
        locale={{
          emptyText: (
            <Empty
              description={<span className="text-ink-3 font-serif text-sm italic">{t('entries.noEntries')}</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />

      <EntryForm
        open={modalOpen}
        entry={selectedEntry}
        onSave={handleSave}
        onCancel={() => setModalOpen(false)}
        categories={categories}
      />
    </div>
  );
};

export default Entries;
