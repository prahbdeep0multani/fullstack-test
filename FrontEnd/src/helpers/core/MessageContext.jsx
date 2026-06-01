import { createContext, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';
import { v4 } from 'uuid';

const MessageContext = createContext({});
export default MessageContext;

export const MessageProvider = props => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  const loadingMsg = useCallback((msg = false, key = v4()) => {
    messageApi.loading({
      content: msg || t('common.saving'),
      key,
      duration: 0
    });

    return key;
  });

  const savedMsg = useCallback((k, msg = false) => {
    messageApi.success({
      key: k,
      content: msg || t('common.saved')
    });
  });

  const errorMsg = useCallback((k, err) => {
    messageApi.error({
      key: k,
      content:
        err.response && err.response.data ? t(`core:errors.${err.response.data.error}`, err.toString()) : err.toString()
    });
  });

  const destroyMsg = useCallback(key => messageApi.destroy(key));

  const contextValue = useMemo(
    () => ({ loadingMsg, savedMsg, errorMsg, destroyMsg }),
    [loadingMsg, savedMsg, errorMsg, destroyMsg]
  );

  return (
    <MessageContext.Provider value={contextValue}>
      {contextHolder}
      {props.children}
    </MessageContext.Provider>
  );
};
