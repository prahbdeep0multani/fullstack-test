import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArrowDownOutlined, ArrowUpOutlined, PlusOutlined, WalletOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Segmented, Select, Statistic, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import ContentPanel from '../components/core/layout/ContentPanel';
import Table from '../components/core/table/Table';
import CostValue from '../components/core/controls/CostValue';
import EntryForm from '../components/entries/EntryForm';
import MessageContext from '../helpers/core/MessageContext';
import useEntries from '../hooks/useEntries';

const { Text } = Typography;
const { Option } = Select;

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
  const { loadingMsg, savedMsg, errorMsg } = useContext(MessageContext);
  const { fetchEntries, createEntry, updateEntry, deleteEntry } = useEntries();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [datePreset, setDatePreset] = useState(null);

  const load = useCallback(
    (extra = {}) => {
      setLoading(true);
      fetchEntries({
        sorter: '-date',
        ...(typeFilter ? { type: typeFilter } : {}),
        ...(datePreset ? { dateFrom: getDateFrom(datePreset) } : {}),
        ...extra
      })
        .then(data => {
          setEntries(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [fetchEntries, typeFilter, datePreset]
  );

  useEffect(() => {
    load();
  }, [load]);

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
        load();
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
        load();
      })
      .catch(err => {
        errorMsg(msg, err);
        throw err;
      });
  };

  const columns = [
    {
      title: t('entries.date'),
      dataIndex: 'date',
      key: 'date',
      render: val => <Text className="whitespace-nowrap font-mono text-sm">{dayjs(val).format('DD/MM/YYYY')}</Text>,
      width: 120
    },
    {
      title: t('common.type'),
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: val =>
        val === 'income' ? (
          <Tag icon={<ArrowUpOutlined />} color="success">
            {t('entries.income')}
          </Tag>
        ) : (
          <Tag icon={<ArrowDownOutlined />} color="error">
            {t('entries.expense')}
          </Tag>
        )
    },
    {
      title: t('common.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: t('common.category'),
      dataIndex: 'category',
      key: 'category',
      width: 130,
      ellipsis: true,
      render: val => (val ? <Tag>{val}</Tag> : null)
    },
    {
      title: t('entries.amount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (val, record) => (<CostValue value={val} className={record.type === 'income' ? 'text-green-600' : 'text-red-500'} />),
    }
  ];

  const balanceColor = totals.balance >= 0 ? '#3f8600' : '#cf1322';

  const statCards = [
    {
      key: 'income',
      title: t('entries.totalIncome'),
      value: totals.totalIncome / 100,
      color: '#3f8600',
      border: 'border-l-green-500',
      icon: <ArrowUpOutlined className="text-2xl text-green-500" />
    },
    {
      key: 'expense',
      title: t('entries.totalExpenses'),
      value: totals.totalExpenses / 100,
      color: '#cf1322',
      border: 'border-l-red-500',
      icon: <ArrowDownOutlined className="text-2xl text-red-500" />
    },
    {
      key: 'balance',
      title: t('entries.balance'),
      value: totals.balance / 100,
      color: balanceColor,
      border: totals.balance >= 0 ? 'border-l-blue-500' : 'border-l-orange-400',
      icon: <WalletOutlined className="text-2xl text-blue-500" />
    }
  ];

  const segmentedOptions = [
    { label: t('entries.allTime'), value: '' },
    ...DATE_PRESETS.map(p => ({ label: t(`entries.${p.label}`), value: p.label }))
  ];

  const typeFilterNode = (
    <Select
      allowClear
      placeholder={t('common.type')}
      style={{ width: 140 }}
      onChange={val => setTypeFilter(val || null)}
      value={typeFilter}
    >
      <Option value="expense">
        <span className="flex items-center gap-1">
          <ArrowDownOutlined className="text-red-500" /> {t('entries.expense')}
        </span>
      </Option>
      <Option value="income">
        <span className="flex items-center gap-1">
          <ArrowUpOutlined className="text-green-600" /> {t('entries.income')}
        </span>
      </Option>
    </Select>
  );

  return (
    <ContentPanel
      title={t('entries.title')}
      titleAction={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          {t('entries.addEntry')}
        </Button>
      }
    >
      <div className="mb-4">
        <Segmented options={segmentedOptions} value={datePreset || ''} onChange={val => setDatePreset(val || null)} />
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        {statCards.map(({ key, title, value, color, border, icon }) => (
          <Col key={key} xs={24} sm={8}>
            <Card className={`rounded-lg border-l-4 shadow-sm ${border}`}>
              <div className="flex items-center justify-between">
                <Statistic title={title} value={value} precision={2} valueStyle={{ color }} suffix="€" />
                {icon}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Table
        dataSource={entries}
        columns={columns}
        rowKey="_id"
        loading={loading}
        editCancelButtonOnRow
        deleteSaveButtonOnRow
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination
        searchBar
        leftActions={typeFilterNode}
        onChangeSearchBar={e => {
          const val = e.target.value;
          fetchEntries({
            sorter: '-date',
            filter: val,
            ...(typeFilter ? { type: typeFilter } : {}),
            ...(datePreset ? { dateFrom: getDateFrom(datePreset) } : {})
          })
            .then(data => setEntries(data))
            .catch(() => { });
        }}
        locale={{
          emptyText: (
            <Empty
              description={<Text type="secondary">{t('entries.noEntries')}</Text>}
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
    </ContentPanel>
  );
};

export default Entries;
