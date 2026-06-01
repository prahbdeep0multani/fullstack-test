import { useContext, useState } from 'react';
import { Layout, Button, Drawer, Tooltip, Popconfirm } from 'antd';
import {
  AccountBookOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FlagIcon } from 'react-flag-kit';

import CpMenu from './Menu';
import AppContext from '../../../helpers/AppContext';
import AuthContext from '../../../helpers/core/AuthContext';
import UserPic from '../user/UserPic';
import { EYEBROW_SM } from '../../../helpers/editorial';

const { Sider } = Layout;

const PrefRow = ({ icon, label, value, onClick, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`border-edge-2 text-ink-2 group flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md border bg-transparent px-3 font-sans transition-all ${
      danger
        ? 'hover:border-expense hover:bg-expense/10 hover:text-expense'
        : 'hover:border-edge hover:bg-fill hover:text-ink'
    }`}
  >
    <span className="inline-flex shrink-0 items-center text-[13px]">{icon}</span>
    <span className="flex-1 text-left text-[10px] font-medium uppercase tracking-[0.12em]">{label}</span>
    {value && (
      <span className="text-ink text-[10px] font-medium uppercase tracking-[0.08em] group-hover:text-current">
        {value}
      </span>
    )}
  </button>
);

const SidebarContent = ({ collapsed = false, setCollapsed, showCollapseBtn = true, onClose }) => {
  const { appTheme, setAppTheme } = useContext(AppContext);
  const { logged, signOut } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (onClose) onClose();
    signOut(() => navigate('/'));
  };

  const isIt = i18n.language.startsWith('it');
  const userRoles = [...(logged?.company?.roles || []), ...(logged?.roles || [])];
  const primaryRole = userRoles[0] === 'admin' ? 'superuser' : userRoles[0] || 'user';

  return (
    <div className="bg-surface flex h-full flex-col overflow-hidden font-sans">
      {/* ── Brand mark ── */}
      <div className={`flex shrink-0 items-center gap-2.5 pb-4 pt-5 ${collapsed ? 'px-3.5' : 'px-4'}`}>
        <AccountBookOutlined className="text-primary shrink-0 text-[22px]" />
        {!collapsed && (
          <span className="text-ink flex-1 whitespace-nowrap font-serif text-[22px] font-normal leading-none -tracking-[0.01em]">
            {import.meta.env.VITE_NAME || 'ContiChiari'}
          </span>
        )}
        {showCollapseBtn && setCollapsed && !collapsed && (
          <Button
            type="text"
            size="small"
            icon={<MenuFoldOutlined />}
            onClick={() => setCollapsed(c => !c)}
            className="!text-ink-3 shrink-0"
          />
        )}
      </div>

      {collapsed && showCollapseBtn && setCollapsed && (
        <div className="flex justify-center pb-2">
          <Button
            type="text"
            size="small"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setCollapsed(c => !c)}
            className="!text-ink-3"
          />
        </div>
      )}

      {/* ── Nav section label ── */}
      {!collapsed && <div className={`${EYEBROW_SM} px-5 pb-2 pt-2`}>Navigation</div>}

      {/* ── Nav ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2">
        <CpMenu />
      </div>

      {/* ── Bottom ── */}
      <div className={`border-edge-2 shrink-0 border-t ${collapsed ? 'px-2 py-3.5' : 'px-4 pb-4 pt-3.5'}`}>
        {!collapsed && <div className={`${EYEBROW_SM} mb-2.5`}>Account</div>}

        {/* User row */}
        <div
          className={`mb-3.5 flex min-w-0 items-center gap-2.5 overflow-hidden ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
        >
          <div className="shrink-0">
            <UserPic user={logged} size={34} link={false} loadPic />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-ink overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium leading-[1.25]">
                {logged?.fullname || logged?.email}
              </div>
              <div className="text-ink-3 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.12em]">
                {primaryRole} · {logged?.company?.name}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        {!collapsed ? (
          <div className="flex flex-col gap-1.5">
            <PrefRow
              icon={appTheme ? <MoonOutlined /> : <SunOutlined />}
              label={t('common.appTheme')}
              value={appTheme ? t('common.dark') : t('common.light')}
              onClick={() => setAppTheme(!appTheme)}
            />

            <PrefRow
              icon={<FlagIcon code={isIt ? 'IT' : 'GB'} size={13} />}
              label={t('common.language')}
              value={isIt ? 'IT' : 'EN'}
              onClick={() => i18n.changeLanguage(isIt ? 'en' : 'it')}
            />

            <Popconfirm
              title={t('login.logout')}
              description={isIt ? 'Sei sicuro di voler uscire?' : 'Are you sure you want to sign out?'}
              okText={t('login.logout')}
              cancelText={t('common.cancel')}
              okButtonProps={{ danger: true }}
              placement="topRight"
              onConfirm={handleSignOut}
            >
              <div className="mt-1">
                <PrefRow icon={<LogoutOutlined />} label={t('login.logout')} danger />
              </div>
            </Popconfirm>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Tooltip title={appTheme ? t('common.light') : t('common.dark')} placement="right">
              <Button
                type="text"
                size="small"
                icon={appTheme ? <SunOutlined /> : <MoonOutlined />}
                onClick={() => setAppTheme(!appTheme)}
              />
            </Tooltip>
            <Tooltip title={isIt ? 'English' : 'Italiano'} placement="right">
              <button
                type="button"
                onClick={() => i18n.changeLanguage(isIt ? 'en' : 'it')}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border-0 bg-transparent"
              >
                <FlagIcon code={isIt ? 'IT' : 'GB'} size={14} />
              </button>
            </Tooltip>
            <Tooltip title={t('login.logout')} placement="right">
              <Button type="text" size="small" danger icon={<LogoutOutlined />} onClick={handleSignOut} />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { isMobile } = useContext(AppContext);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Button
          type="primary"
          icon={<MenuOutlined />}
          size="small"
          onClick={() => setDrawerOpen(true)}
          className="!fixed !left-3.5 !top-3.5 !z-[1001] !rounded-lg shadow-md"
        />
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={240}
          styles={{ body: { padding: 0 }, header: { display: 'none' } }}
        >
          <SidebarContent showCollapseBtn={false} onClose={() => setDrawerOpen(false)} />
        </Drawer>
      </>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={64}
      width={236}
      className="border-edge-2 !bg-surface !sticky !top-0 !h-screen overflow-hidden border-r"
    >
      <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
    </Sider>
  );
};

export default Sidebar;
