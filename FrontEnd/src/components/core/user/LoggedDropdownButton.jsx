import { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, Dropdown, Space } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff, faAngleDown, faCircle, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FlagIcon } from 'react-flag-kit';
import { useNavigate } from 'react-router-dom';

import AppContext from '../../../helpers/AppContext';
import UserInfo from './UserInfo';

import '../../../styles/core/components/LoggedDropdownButton.css';

import AuthContext from '../../../helpers/core/AuthContext';

const UserDropdownButton = props => {
  const { t, i18n } = useTranslation();
  const { logged, signOut } = useContext(AuthContext);
  const { appTheme, setAppTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const lastClickedKey = useRef(null);

  const stayOpenKeys = ['it', 'en', 'darkmode'];

  const onClick = ({ key }) => {
    lastClickedKey.current = key;
    switch (key) {
      case 'it':
      case 'en':
        return i18n.changeLanguage(key);
      case 'logout':
        return signOut(() => navigate('/', { intended: '/' }));
      default:
        return null;
    }
  };

  const handleOpenChange = flag => {
    if (!flag && stayOpenKeys.includes(lastClickedKey.current)) {
      lastClickedKey.current = null;
      return;
    }
    lastClickedKey.current = null;
    setOpen(flag);
  };

  const items = [
    {
      icon: <FontAwesomeIcon icon={faCircle} />,
      label: (
        <Space>
          {t('common.appTheme')}
          <Switch
            checked={appTheme}
            onChange={checked => setAppTheme(checked)}
            checkedChildren={t('common.dark')}
            unCheckedChildren={t('common.light')}
            className="ml-8"
          />
        </Space>
      ),
      key: 'darkmode'
    },
    {
      icon: <FontAwesomeIcon icon={faGlobe} />,
      label: t('common.language'),
      key: 'language',
      children: [
        {
          key: 'it',
          label: (
            <Space>
              <FlagIcon code="IT" size={14} className="w-5" />
              {t('langs.IT')}
            </Space>
          )
        },
        {
          key: 'en',
          label: (
            <Space>
              <FlagIcon code="GB" size={14} className="w-5" />
              {t('langs.EN')}
            </Space>
          )
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      icon: <FontAwesomeIcon icon={faPowerOff} />,
      label: t('login.logout'),
      key: 'logout'
    }
  ];

  return (
    <Dropdown.Button
      size="large"
      menu={{ items, onClick }}
      type="text"
      className="logged-dropdown-button"
      onOpenChange={handleOpenChange}
      open={open}
      onClick={() => setOpen(true)}
      icon={<FontAwesomeIcon icon={faAngleDown} />}
    >
      <UserInfo user={logged} link={false} />
    </Dropdown.Button>
  );
};

export default UserDropdownButton;
