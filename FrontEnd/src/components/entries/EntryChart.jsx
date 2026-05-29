import { useMemo } from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Text } = Typography;

const EntryChart = ({ entries }) => {
  const { t } = useTranslation();

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
      label: dayjs(key).format('MMM YY'),
      income: val.income / 100,
      expense: val.expense / 100
    }));
  }, [entries]);

  const maxVal = Math.max(...months.flatMap(m => [m.income, m.expense]), 1);

  return (
    <Card className="rounded-lg shadow-sm" title={<Text strong>{t('entries.chartTitle')}</Text>}>
      <div className="flex h-48 items-end justify-around gap-1 px-2">
        {months.map(({ label, income, expense }) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end justify-center gap-1" style={{ height: '160px' }}>
              {/* Income bar */}
              <div className="group relative flex w-5 min-w-0 flex-1 justify-center">
                <div
                  className="w-full rounded-t bg-green-400 transition-all duration-300 hover:bg-green-500"
                  style={{ height: `${Math.max((income / maxVal) * 160, income > 0 ? 4 : 0)}px` }}
                  title={`${t('entries.income')}: €${income.toFixed(2)}`}
                />
              </div>
              {/* Expense bar */}
              <div className="group relative flex w-5 min-w-0 flex-1 justify-center">
                <div
                  className="w-full rounded-t bg-red-400 transition-all duration-300 hover:bg-red-500"
                  style={{ height: `${Math.max((expense / maxVal) * 160, expense > 0 ? 4 : 0)}px` }}
                  title={`${t('entries.expense')}: €${expense.toFixed(2)}`}
                />
              </div>
            </div>
            <Text className="text-center text-xs text-gray-500">{label}</Text>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex justify-center gap-6">
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-400" />
          {t('entries.income')}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-400" />
          {t('entries.expense')}
        </span>
      </div>
    </Card>
  );
};

export default EntryChart;
