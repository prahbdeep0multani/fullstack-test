import { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSync, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

import Api from '../../../helpers/core/Api';

const getIcon = check => {
  if (check === 1) return <FontAwesomeIcon icon={faCheckCircle} />;
  if (check === 0) return <FontAwesomeIcon icon={faSync} />;
  return <FontAwesomeIcon icon={faExclamationCircle} />;
};

const getColor = check => {
  if (check === 1) return 'success';
  if (check === 0) return 'processing';
  return 'error';
};

const APICheck = props => {
  const [message, setMessage] = useState('Loading...');
  const [check, setCheck] = useState(0);

  useEffect(() => {
    Api.get('/')
      .then(res => {
        setMessage(res.data.message);
        setCheck(1);
      })
      .catch(() => {
        setCheck(-1);
      });
  }, []);

  const icon = getIcon(check);
  const color = getColor(check);

  return (
    <div className="api-check">
      <Tag icon={icon} color={color}>
        {message}
      </Tag>
    </div>
  );
};

export default APICheck;
