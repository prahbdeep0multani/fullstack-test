import { useContext } from 'react';
import { ConfigProvider, theme, App } from 'antd';

import AppContext from '../AppContext';
import { light, dark } from '../../theme/ant.config';

const { defaultAlgorithm, darkAlgorithm } = theme;

const ThemeProvider = ({ children }) => {
  const { appTheme } = useContext(AppContext);

  if (appTheme) document.body.classList.add('dark');
  else document.body.classList.remove('dark');

  return (
    <ConfigProvider theme={{ algorithm: appTheme ? darkAlgorithm : defaultAlgorithm, ...(appTheme ? dark : light) }}>
      <App>{children}</App>
    </ConfigProvider>
  );
};

export default ThemeProvider;
