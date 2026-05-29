import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArrowDownOutlined, ArrowRightOutlined, ArrowUpOutlined, WalletOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, List, Row, Segmented, Statistic, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import ContentPanel from '../components/core/layout/ContentPanel';
import CostValue from '../components/core/controls/CostValue';
import EntryChart from '../components/entries/EntryChart';
import AuthContext from '../helpers/core/AuthContext';
import useEntries from '../hooks/useEntries';

const { Title, Text } = Typography;

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

const CATCHPHRASES = ['Tieni traccia di ogni euro.', 'Il controllo inizia da qui.', 'Bilancio chiaro, mente libera.'];

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

  const recent = useMemo(() => entries.slice(0, 5), [entries]);

  const balanceColor = totals.balance >= 0 ? '#3f8600' : '#cf1322';

  const catchphrase = CATCHPHRASES[dayjs().date() % CATCHPHRASES.length];

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

  return (
    <ContentPanel loading={loading}>
      {/* Welcome banner */}
      <Card className="mb-6 rounded-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Title level={3} className="mb-1">
              Ciao{logged?.name ? `, ${logged.name}` : ''}!
            </Title>
            <Text type="secondary" className="text-base">
              {catchphrase}
            </Text>
            <div className="mt-1">
              <Text type="secondary" className="text-xs">
                {dayjs().format('dddd, D MMMM YYYY')}
              </Text>
            </div>
          </div>
          <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/entries')}>
            {t('entries.title')}
          </Button>
        </div>
      </Card>

      {/* Date range filter */}
      <div className="mb-4">
        <Segmented options={segmentedOptions} value={datePreset || ''} onChange={val => setDatePreset(val || null)} />
      </div>

      {/* Stat cards */}
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

      {/* Chart */}
      <div className="mb-6">
        <EntryChart entries={entries} />
      </div>

      {/* Recent entries */}
      <Card
        className="rounded-lg shadow-sm"
        title={<Text strong>Ultime voci</Text>}
        extra={
          <Button type="link" onClick={() => navigate('/entries')}>
            {t('common.details')} <ArrowRightOutlined />
          </Button>
        }
      >
        <List
          dataSource={recent}
          locale={{
            emptyText: (
              <Empty
                description={<Text type="secondary">{t('entries.noEntries')}</Text>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
          renderItem={item => (
            <List.Item
              extra={
                <CostValue value={item.amount} className={item.type === 'income' ? 'text-green-600' : 'text-red-500'} />
              }
            >
              <List.Item.Meta
                avatar={
                  item.type === 'income' ? (
                    <ArrowUpOutlined className="mt-1 text-lg text-green-500" />
                  ) : (
                    <ArrowDownOutlined className="mt-1 text-lg text-red-500" />
                  )
                }
                title={
                  <span className="flex items-center gap-2">
                    <Text>{item.description || '—'}</Text>
                    {item.category && <Tag>{item.category}</Tag>}
                  </span>
                }
                description={
                  <Text type="secondary" className="text-xs">
                    {dayjs(item.date).format('DD/MM/YYYY')}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </ContentPanel>
  );
};

export default Home;
