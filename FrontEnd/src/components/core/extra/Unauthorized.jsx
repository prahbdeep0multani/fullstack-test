import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';

const Unauthorized = () => {
  const { t } = useTranslation();

  return (
    <Result
      status="403"
      title={t('common.unauthorized')}
      subTitle={t('common.unauthorizedSub')}
      extra={
        <Button type="primary">
          <Link to="/">{t('common.back')}</Link>
        </Button>
      }
    />
  );
};

export default memo(Unauthorized);
