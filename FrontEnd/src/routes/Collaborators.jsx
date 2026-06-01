import { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Select, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import UserPic from '../components/core/user/UserPic';
import MessageContext from '../helpers/core/MessageContext';
import AuthContext from '../helpers/core/AuthContext';
import AppContext from '../helpers/AppContext';
import useCollaborators from '../hooks/useCollaborators';
import { EYEBROW, EYEBROW_SM, PAGE, PAGE_MOBILE, PAGE_TITLE } from '../helpers/editorial';

const ROLES = ['superuser', 'user'];

const roleAccent = {
  superuser: 'text-[#7c3aed]',
  admin: 'text-[#2563eb]',
  user: 'text-ink-2'
};

const roleDot = {
  superuser: 'bg-[#7c3aed]',
  admin: 'bg-[#2563eb]',
  user: 'bg-ink-3'
};

const Collaborators = () => {
  const { t } = useTranslation();
  const { isMobile } = useContext(AppContext);
  const { loadingMsg, savedMsg, errorMsg } = useContext(MessageContext);
  const { logged } = useContext(AuthContext);
  const { fetchCollaborators, inviteCollaborator, removeCollaborator } = useCollaborators();

  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const load = useCallback(() => {
    setLoading(true);
    fetchCollaborators()
      .then(data => {
        setCollaborators(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [fetchCollaborators]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleRemove = record => {
    const msg = loadingMsg();
    return removeCollaborator(record._id)
      .then(() => {
        savedMsg(msg);
        refresh();
      })
      .catch(err => errorMsg(msg, err));
  };

  const handleInvite = () => {
    form.validateFields().then(values => {
      setInviteLoading(true);
      const msg = loadingMsg();
      const { role, ...rest } = values;
      inviteCollaborator({ ...rest, roles: [role] })
        .then(() => {
          savedMsg(msg);
          setModalOpen(false);
          form.resetFields();
          refresh();
        })
        .catch(err => errorMsg(msg, err))
        .finally(() => setInviteLoading(false));
    });
  };

  const filtered = search
    ? collaborators.filter(
        c =>
          c.fullname?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : collaborators;

  const activeCount = collaborators.filter(c => c.active).length;
  const pendingCount = collaborators.length - activeCount;

  const formLabel = label => <span className={EYEBROW_SM}>{label}</span>;

  return (
    <div className={isMobile ? PAGE_MOBILE : PAGE}>
      {/* ── Header ── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className={`${EYEBROW} mb-1.5`}>{t('collaborators.title')}</div>
          <div className={PAGE_TITLE}>{t('collaborators.title')}</div>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          {t('collaborators.invite')}
        </Button>
      </div>

      {/* ── Stats strip ── */}
      <div className="border-edge-2 mb-6 flex flex-wrap gap-8 border-b pb-6">
        <div>
          <div className={`${EYEBROW_SM} mb-1`}>Total</div>
          <div className="text-ink font-serif text-[32px] font-normal leading-none">{collaborators.length}</div>
        </div>
        <div className="bg-edge-2 w-px self-stretch" />
        <div>
          <div className={`${EYEBROW_SM} mb-1`}>{t('collaborators.active')}</div>
          <div className="text-income font-serif text-[32px] font-normal leading-none">{activeCount}</div>
        </div>
        <div className="bg-edge-2 w-px self-stretch" />
        <div>
          <div className={`${EYEBROW_SM} mb-1`}>{t('collaborators.pending')}</div>
          <div className="font-serif text-[32px] font-normal leading-none text-[#d97706]">{pendingCount}</div>
        </div>
      </div>

      {/* ── Search ── */}
      <Input
        allowClear
        prefix={<SearchOutlined className="text-ink-3" />}
        placeholder={t('common.filter')}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 max-w-[360px]"
      />

      {/* ── Roster list ── */}
      {loading && <div className="text-ink-3 py-10 text-center text-[13px]">{t('common.loading')}…</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-ink-3 py-10 text-center font-serif text-sm italic">{t('common.no_results')}</div>
      )}

      {!loading &&
        filtered.map((c, i) => {
          const role = c.company?.roles?.[0] || 'user';
          const isMe = c._id === logged?._id;
          const last = i === filtered.length - 1;
          return (
            <div key={c._id} className={`flex items-center gap-3.5 py-3.5 ${last ? '' : 'border-edge-2 border-b'}`}>
              <div className="shrink-0">
                <UserPic user={c} size={36} link={false} loadPic />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-ink overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">
                  {c.fullname || c.email}
                  {isMe && <span className={`${EYEBROW_SM} !text-primary ml-2`}>YOU</span>}
                </div>
                <div className="text-ink-3 overflow-hidden text-ellipsis whitespace-nowrap text-[11px]">{c.email}</div>
              </div>

              {/* Role */}
              <div className="flex min-w-[90px] items-center gap-1.5">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${roleDot[role] || 'bg-ink-3'}`} />
                <span
                  className={`text-[10px] font-medium uppercase tracking-[0.1em] ${roleAccent[role] || 'text-ink-2'}`}
                >
                  {role}
                </span>
              </div>

              {/* Status */}
              <div className="min-w-[80px] text-right">
                <span
                  className={`font-sans text-[10px] uppercase tracking-[0.1em] ${
                    c.active ? 'text-income' : 'text-[#d97706]'
                  }`}
                >
                  {t(c.active ? 'collaborators.active' : 'collaborators.pending')}
                </span>
              </div>

              {/* Actions */}
              <div className="w-10 text-right">
                {!isMe && (
                  <Popconfirm
                    title={t('common.sureToDelete')}
                    okText={t('common.yes')}
                    cancelText={t('common.no')}
                    placement="left"
                    onConfirm={() => handleRemove(c)}
                  >
                    <Tooltip title={t('collaborators.remove')}>
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                )}
              </div>
            </div>
          );
        })}

      {/* ── Invite modal ── */}
      <Modal
        title={<span className="font-serif text-[22px] font-normal">{t('collaborators.inviteTitle')}</span>}
        open={modalOpen}
        onOk={handleInvite}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={inviteLoading}
        okText={t('collaborators.sendInvite')}
        cancelText={t('common.cancel')}
        width={440}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4 font-sans">
          <Form.Item
            name="email"
            label={formLabel(t('collaborators.email'))}
            rules={[
              { required: true, message: t('validation.required') },
              { type: 'email', message: t('collaborators.invalidEmail') }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="name@company.com" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="name" label={formLabel(t('collaborators.firstName'))}>
              <Input placeholder={t('collaborators.firstName')} />
            </Form.Item>
            <Form.Item name="lastname" label={formLabel(t('collaborators.lastName'))}>
              <Input placeholder={t('collaborators.lastName')} />
            </Form.Item>
          </div>

          <Form.Item
            name="role"
            label={formLabel(t('collaborators.role'))}
            initialValue="user"
            rules={[{ required: true, message: t('validation.required') }]}
          >
            <Select>
              {ROLES.map(r => (
                <Select.Option key={r} value={r}>
                  <span className="inline-flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${roleDot[r] || 'bg-ink-3'}`} />
                    <span className="capitalize">{r}</span>
                  </span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Collaborators;
