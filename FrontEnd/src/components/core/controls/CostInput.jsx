import { useCallback, useEffect, useState } from 'react';
import { InputNumber } from 'antd';
import config from '../../../config';

const { defaultCurrency, defaultCostFormat, centsBasedCosts } = config;

export const CostInputFormats = {
  DOT_DECIMALS: 'en-US',
  COMMA_DECIMALS: 'it-IT'
};

const CostInput = ({
  currency,
  value = '0.00',
  onChange = () => {},
  format = defaultCostFormat || CostInputFormats.COMMA_DECIMALS,
  unitOfMeasurement = {},
  centsBased = centsBasedCosts ?? false,
  ...props
}) => {
  const [internvalValue, setInternalValue] = useState(value);
  const [displayedCurrency, setDisplayedCurrency] = useState('');

  const parser = useCallback(
    input => {
      let normalized = input;
      if (normalized.includes(',') && normalized.includes('.')) {
        const lastCommaIndex = normalized.lastIndexOf(',');
        const lastDotIndex = normalized.lastIndexOf('.');
        if (lastCommaIndex > lastDotIndex) {
          normalized = normalized.replace(/\./g, '');
        } else {
          normalized = normalized.replace(/,/g, '');
        }
      }
      const sanitizedValue = normalized.toString().replace(',', '.');
      const numericalValue = parseFloat(sanitizedValue);
      return centsBased ? Math.round(numericalValue * 100) : numericalValue;
    },
    [centsBased]
  );

  const formatter = useCallback(
    (val, { userTyping }) => {
      const centsAdjusted = centsBased ? val / 100 : val;
      if (!userTyping) return Intl.NumberFormat(format).format(centsAdjusted);
      return centsAdjusted;
    },
    [format, centsBased]
  );

  useEffect(() => {
    if (currency) return setDisplayedCurrency(currency.toUpperCase());
    return setDisplayedCurrency(defaultCurrency);
  }, [currency]);

  return (
    <InputNumber
      min={0}
      {...props}
      value={internvalValue}
      onChange={_v => {
        setInternalValue(_v);
        onChange(_v);
      }}
      addonAfter={unitOfMeasurement.symbol ? `${displayedCurrency}/${unitOfMeasurement.symbol}` : displayedCurrency}
      parser={parser}
      formatter={formatter}
    />
  );
};

export default CostInput;
