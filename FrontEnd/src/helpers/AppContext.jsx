import { useState, createContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBook, faUsers } from '@fortawesome/free-solid-svg-icons';

import useLocalStorage from '../hooks/core/useLocalStorage';

import config from '../config';
import useOnResize from '../hooks/core/useOnResize';

const AppContext = createContext({});
export default AppContext;

const MacroMenu = {
  Home: 1
};

export const AppProvider = props => {
  const { t } = useTranslation();

  const [isMobile, setIsMobile] = useState(false);
  const [appTheme, setAppTheme] = useLocalStorage('theme', false);

  const [defaultCurrency] = useState(config.defaultCurrency);
  const [itemXpage] = useState(config.itemXpage);

  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [macroMenuSelection, setMacroMenuSelection] = useState(MacroMenu.Home);

  const menuItems = {
    [MacroMenu.Home]: [
      {
        label: <Link to="/">{t('common.home')}</Link>,
        key: 'home',
        icon: <FontAwesomeIcon icon={faHome} />,
        authorizedRoles: ['superuser', 'user']
      },
      {
        label: <Link to="/entries">{t('entries.title')}</Link>,
        key: 'entries',
        icon: <FontAwesomeIcon icon={faBook} />,
        authorizedRoles: ['superuser', 'user']
      },
      {
        label: <Link to="/collaborators">{t('collaborators.title')}</Link>,
        key: 'collaborators',
        icon: <FontAwesomeIcon icon={faUsers} />,
        authorizedRoles: ['superuser']
      }
    ]
  };

  /* Mobile Management */
  useOnResize(() => setIsMobile(window.innerWidth < 768));

  const exportedValue = useMemo(
    () => ({
      isMobile,
      appTheme,
      setAppTheme,
      defaultCurrency,
      itemXpage,
      menuItems,
      MacroMenu,
      setSelectedMenuItem,
      selectedMenuItem,
      macroMenuSelection,
      setMacroMenuSelection
    }),
    [isMobile, appTheme, defaultCurrency, itemXpage, menuItems, MacroMenu, selectedMenuItem, macroMenuSelection]
  );

  return <AppContext.Provider value={exportedValue}>{props.children}</AppContext.Provider>;
};
