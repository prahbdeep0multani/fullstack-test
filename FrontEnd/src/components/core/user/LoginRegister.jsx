import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Checkbox, Modal, Alert } from 'antd';
import { AccountBookOutlined } from '@ant-design/icons';

import Api from '../../../helpers/core/Api';
import AuthContext, { AuthStatus } from '../../../helpers/core/AuthContext';
import { EYEBROW, EYEBROW_SM, PAGE_TITLE } from '../../../helpers/editorial';

const LoginRegister = ({ afterSignIn = () => {} }) => {
  const { t, i18n } = useTranslation();
  const { signIn, setLogged, setAuthStatus } = useContext(AuthContext);

  const MODE = {
    INIT: t('login.continue'),
    LOGIN: t('login.login'),
    REGISTER: t('login.register'),
    FORGOT_PWD: t('login.forgotPasswordBtn')
  };

  const passwordRef = useRef();

  const [loginMode, setLoginMode] = useState(MODE.INIT);
  const [emailError, setEmailError] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [reset, setReset] = useState(false);
  const [privacyError, setPrivacyError] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPwdOk, setForgotPwdOk] = useState(false);

  const [form] = Form.useForm();

  const handleBack = () => (loginMode === MODE.FORGOT_PWD ? setLoginMode(MODE.LOGIN) : setLoginMode(MODE.INIT));

  useEffect(() => {
    if (reset) {
      setLoginMode(MODE.INIT);
      setReset(false);
      form.resetFields();
    }
  }, [reset]);

  useEffect(() => {
    if (passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [loginMode]);

  const handleCheckEmail = email => {
    setLoading(true);
    return Api.get(`/auth/email/${email}`)
      .then(() => {
        setLoginMode(MODE.LOGIN);
      })
      .catch(err => {
        const errorCode = err.response && err.response.data ? err.response.data.error : null;
        if (errorCode === 404) {
          return setLoginMode(MODE.REGISTER);
        }
        return err?.globalHandler();
      })
      .finally(() => setLoading(false));
  };

  const handleLogin = (email, password) => {
    setLoading(true);
    return signIn(email, password, afterSignIn)
      .catch(err => {
        const errorCode = err.response && err.response.data ? err.response.data.error : null;
        if (errorCode === 300) return setEmailError(t(`core:errors.${errorCode}`));
        if (errorCode === 301) return setPwdError(t(`core:errors.${errorCode}`));

        return err?.globalHandler();
      })
      .finally(() => setLoading(false));
  };

  const handleRegister = (email, password, name, lastname, privacy) => {
    if (!privacy) {
      return setPrivacyError(t('core:errors.201'));
    }

    setLoading(true);
    return Api.post('/auth/register', {
      email,
      password,
      name,
      lastname,
      lang: i18n.language
    })
      .then(res => {
        setLogged(res.data);
        setAuthStatus(AuthStatus.SignedIn);
      })
      .catch(err => err?.globalHandler())
      .finally(() => setLoading(false));
  };

  const handleForgotPwd = email =>
    Api.post(`/auth/forgotPassword?website=true`, { email })
      .then(() => {
        setForgotPwdOk(true);
      })
      .catch(err => {
        const errorCode = err.response && err.response.data ? err.response.data.error : null;
        if (errorCode === 404) return setEmailError(t('core:errors.210'));

        return err?.globalHandler();
      });

  const handleSubmit = ({ email = '', password = '', name = '', lastname = '', privacy = false }) => {
    if (loginMode === MODE.INIT) return handleCheckEmail(email);
    if (loginMode === MODE.LOGIN) return handleLogin(email, password);
    if (loginMode === MODE.FORGOT_PWD) return handleForgotPwd(email);
    return handleRegister(email, password, name, lastname, privacy);
  };

  const validateMessages = { required: t('core:errors.201') };

  const privacyLink = () => {
    const str = t('login.privacy_check').split('%s');
    return (
      <>
        {str[0]}
        <Link to="/#">{t('login.privacy')}</Link>
        {str[1]}
      </>
    );
  };

  if (!navigator.cookieEnabled) {
    return Modal.error({ title: t('cookie.title'), content: t('cookie.message') });
  }

  const sublabel = {
    [MODE.INIT]: 'Enter your email to continue',
    [MODE.LOGIN]: 'Welcome back',
    [MODE.REGISTER]: 'Create your account',
    [MODE.FORGOT_PWD]: t('login.forgotPasswordTitle')
  };

  const fieldLabel = label => <span className={EYEBROW_SM}>{label}</span>;

  return (
    <div className="bg-surface-2 flex min-h-screen items-center justify-center px-5 py-10 font-sans">
      <div className="w-full max-w-[380px]">
        {/* Brand mark */}
        <div className="mb-8 flex items-center gap-2.5">
          <AccountBookOutlined className="text-primary text-[22px]" />
          <span className="text-ink text-[13px] font-medium uppercase tracking-[0.08em]">
            {import.meta.env.VITE_NAME || 'ContiChiari'}
          </span>
        </div>

        {/* Title */}
        <div className={`${EYEBROW} mb-2.5`}>{sublabel[loginMode]}</div>
        <div className={`${PAGE_TITLE} mb-8`}>
          {loginMode === MODE.INIT && t('login.welcome')}
          {loginMode === MODE.LOGIN && t('login.login')}
          {loginMode === MODE.REGISTER && t('login.register')}
          {loginMode === MODE.FORGOT_PWD && t('login.forgotPasswordTitle')}
        </div>

        <Form
          id="loginForm"
          form={form}
          layout="vertical"
          requiredMark={false}
          validateMessages={validateMessages}
          onFinish={handleSubmit}
          className="font-sans"
        >
          {forgotPwdOk && (
            <Alert message={t('login.changePasswordEmailSent')} type="success" showIcon className="mb-4" />
          )}

          <Form.Item
            name="email"
            label={fieldLabel('Email')}
            validateTrigger="onSubmit"
            validateStatus={emailError ? 'error' : undefined}
            help={emailError || undefined}
            onChange={() => setEmailError(false)}
            rules={[{ required: true }, { type: 'email', message: t('core:errors.210') }]}
          >
            <Input
              autoFocus
              size="large"
              readOnly={loginMode === MODE.REGISTER}
              placeholder="name@company.com"
              value={emailValue}
              onChange={value => setEmailValue(value)}
              disabled={forgotPwdOk}
            />
          </Form.Item>

          {(loginMode === MODE.LOGIN || loginMode === MODE.REGISTER) && (
            <Form.Item
              name="password"
              label={fieldLabel(t('core:fields.password'))}
              validateTrigger="onSubmit"
              validateStatus={pwdError ? 'error' : undefined}
              help={pwdError || undefined}
              onChange={() => setPwdError(false)}
              rules={[{ required: true }]}
            >
              <Input.Password ref={passwordRef} size="large" placeholder="••••••••" />
            </Form.Item>
          )}

          {loginMode === MODE.REGISTER && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Form.Item
                  validateTrigger="onSubmit"
                  name="name"
                  label={fieldLabel(t('common.name'))}
                  rules={[{ required: true }]}
                >
                  <Input size="large" placeholder={t('common.name')} maxLength="128" />
                </Form.Item>

                <Form.Item
                  name="lastname"
                  validateTrigger="onSubmit"
                  label={fieldLabel(t('login.lastname'))}
                  rules={[{ required: true }]}
                >
                  <Input size="large" placeholder={t('login.lastname')} maxLength="128" />
                </Form.Item>
              </div>

              <Form.Item
                name="privacy"
                valuePropName="checked"
                validateStatus={privacyError ? 'error' : undefined}
                validateTrigger="onSubmit"
                help={privacyError || undefined}
                onChange={() => setPrivacyError(false)}
                rules={[{ required: true }]}
                className="mt-3"
              >
                <Checkbox>
                  <span className="text-ink-2 text-xs">{privacyLink()}</span>
                </Checkbox>
              </Form.Item>
            </>
          )}

          {loginMode === MODE.LOGIN && (
            <div className="-mt-2 mb-4 text-right">
              <button
                type="button"
                onClick={() => setLoginMode(MODE.FORGOT_PWD)}
                className="text-ink-2 cursor-pointer border-none bg-transparent p-0 text-[11px] uppercase tracking-[0.05em]"
              >
                {t('login.forgotPassword')}
              </button>
            </div>
          )}

          <div className="mt-6 flex gap-2.5">
            {loginMode !== MODE.INIT && (
              <Button size="large" disabled={loading} onClick={() => handleBack()}>
                {t('common.back')}
              </Button>
            )}
            <Button
              form="loginForm"
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              block={loginMode === MODE.INIT}
              className={loginMode !== MODE.INIT ? 'flex-1' : ''}
            >
              {loginMode}
            </Button>
          </div>
        </Form>

        {/* Footer mark */}
        <div className="text-ink-3 mt-10 text-center font-serif text-[10px] uppercase italic tracking-[0.12em]">
          {t('home.catchphrase1')}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
